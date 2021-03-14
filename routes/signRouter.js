const express = require('express')
const signRouter = express.Router()

const {auth, signup, signin, info, newToken, logout} = require('../controllers/signController.js')

signRouter.post('/signup', signup)
signRouter.post('/signin', signin)
signRouter.get('/info', auth, info)
signRouter.post('/signin/new_token', newToken)
signRouter.get('/logout', logout)

module.exports = signRouter