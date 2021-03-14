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
    try {
        const token = getTokenFromHeader(req, res, next)
        const payload = await jwtVerifyPromise(token, process.env.ACCESS_TOKEN_SECRET)

        if (!payload) return next(Error('Authorization fail (bad token)'))
        console.log(payload)

        const userDB = await User.findOne({attributes: ['login'], where: {login: payload.id}}, {raw: true})

        if (!userDB) return next(Error('Authorization fail (User not found)'))

        req.user = userDB

        return next()
    } catch (err) {
        next(err)
    }
}

async function signup(req, res, next) {
    try {
        const {id: login, password} = req.body

        if (!login || !password) return next(Error('Please fill id and password'))

        let userDB = await User.findOne({where: {login: login}}, {raw: true})

        if (userDB) return next(Error('User already exists'))

        const accessToken = generateAccessToken(login)
        const refreshToken = generateRefreshToken(login)

        const user = await User.build({
            login: login,
            accessToken: accessToken,
            refresh_token: refreshToken
        })
        await user.setPassword(password)
        await user.save()

        res
            .status(200)
            .json({
                id: login,
                accessToken,
                refreshToken
            })
    } catch (err) {
        next(err)
    }
}

async function signin(req, res, next) {
    try {
        const {id: login, password} = req.body

        if (!login || !password) return next(Error('Please fill id and password'))

        const userDB = await User.findOne({where: {login: login}}, {raw: true})

        if (!userDB) return next(Error('User not found'))

        const isValidPassword = await userDB.checkPassword(password)

        if (!isValidPassword) return next(Error('Wrong password'))

        const accessToken = generateAccessToken(login)

        res
            .status(200)
            .json({
                id: login,
                token: accessToken
            })
    } catch (err) {
        next(err)
    }
}

function info(req, res, next) {
    if (!req.user) return next(Error('Not authorized'))

    res
        .status(200)
        .json({id: req.user.login})
}

async function newToken(req, res, next) {
    try {
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
    } catch (err) {
        next(err)
    }
}

async function logout(req, res, next) {
    try {
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
    } catch (err) {
        next(err)
    }
}

module.exports = {
    auth,
    signup,
    signin,
    info,
    newToken,
    logout
}

