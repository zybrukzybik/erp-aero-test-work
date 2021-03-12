const express = require('express')
const signRouter = express.Router()
// const asyncHandler = require('express-async-handler')
const asyncHandler = function (callback) {
    return function (req, res, next) {
        callback(req, res, next)
            .catch(next)
    }
}

const {auth, signup, signin, info, newToken, logout} = require('../controllers/signController.js')

signRouter.post('/signup', asyncHandler(signup))
signRouter.post('/signin', asyncHandler(signin))
signRouter.get('/info', asyncHandler(auth), asyncHandler(info))
signRouter.post('/signin/new_token', asyncHandler(newToken))
signRouter.get('/logout', asyncHandler(logout))

module.exports = signRouter