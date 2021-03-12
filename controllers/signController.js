const util = require('util')
const jwt = require('jsonwebtoken')

const User = require('../Models/User')

const jwtVerifyPromise = util.promisify(jwt.verify)

const generateAccessToken = id => jwt.sign({id: id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '300s'})


const generateRefreshToken = id => jwt.sign({id: id}, process.env.REFRESH_TOKEN_SECRET)

const getTokenFromHeader = (req, res, next) => {
    if (!req.headers.authorization) return next(Error('No authorization header'))

    const token = req.headers.authorization.split(' ')[1]

    if (!token) return next(Error('No authorization token'))

    return token
}

async function auth(req, res, next) {
    const token = getTokenFromHeader(req, res, next)
    const payload = await jwtVerifyPromise(token, process.env.ACCESS_TOKEN_SECRET, {})

    if (!payload) return next(Error('Authorization fail (bad token)'))

    const user = await User.findOne({attributes: ['login'], where: {login: payload.id}}, {raw: true})

    if (!user) return next(Error('Authorization fail (User not found)'))

    req.user = user

    next()
}

async function signup(req, res, next) {
    const {id: login, password} = req.body

    if (!login || !password) return next(Error('Please fill id and password'))

    const result = await User.findOne({where: {login: login}}, {raw: true})

    if (result) return next(Error('User already exists'))

    const accessToken = generateAccessToken(login)
    const refreshToken = generateRefreshToken(login)

    await User.create({
        login: login,
        salt: 'salt',
        password: password,
        accessToken: accessToken,
        refresh_token: refreshToken
    })

    res
        .status(200)
        .json({
            login,
            password,
            accessToken,
            refreshToken
        })
}

async function signin(req, res, next) {
    const {id: login, password} = req.body

    if (!login || !password) return next(Error('Please fill id and password'))

    const result = await User.findOne({where: {login: login, password: password}}, {raw: true})

    if (!result) return next(Error('User not found'))

    const accessToken = generateAccessToken(login)

    res
        .status(200)
        .json({
            id: login,
            token: accessToken
        })
}

async function info(req, res, next) {
    if (!req.user) return next(Error('Not authorized'))

    res
        .status(200)
        .json({id: req.user.login})
}

async function newToken(req, res, next) {
    const refreshToken = getTokenFromHeader(req, res, next)
    const payload = await jwtVerifyPromise(refreshToken, process.env.REFRESH_TOKEN_SECRET, {})

    if (!payload) return next(Error('Authorization fail (bad token)'))

    const accessToken = generateAccessToken(payload.id)

    res
        .status(200)
        .json({
            id: payload.id,
            accessToken: accessToken
        })
}

async function logout(req, res, next) {
    const refreshToken = getTokenFromHeader(req, res, next)
    const payload = await jwtVerifyPromise(refreshToken, process.env.REFRESH_TOKEN_SECRET, {})

    if (!payload) return next(Error('Authorization fail (bad token)'))

    const newRefreshToken = generateRefreshToken(payload.id)

    await User.update({
        refresh_token: newRefreshToken
    }, {
        where: {login: payload.id}
    })

    res
        .status(200)
        .json({
            id: payload.id,
            refreshToken: newRefreshToken
        })
}

module.exports = {
    auth,
    signup,
    signin,
    info,
    newToken,
    logout
}

