const crypto = require('crypto')
const {promisify} = require('util')
const {DataTypes} = require('sequelize')

const sequelize = require('../utils/dbConnection')

const cryptoPbkdf2 = promisify(crypto.pbkdf2)
const cryptoRandomBytes = promisify(crypto.randomBytes)

async function generateSalt() {
    const buffer = await cryptoRandomBytes(128)
    return buffer.toString('hex')
}

async function generatePassword(password, salt) {
    const key = await cryptoPbkdf2(
        password, salt,
        1,
        128,
        'sha512'
    )
    return key.toString('hex')
}

async function setPassword(password) {
    this.salt = await generateSalt()
    this.password = await generatePassword(password, this.salt)
}

async function checkPassword(password) {
    if (!password) return false

    const hash = await generatePassword(password, this.salt)

    return hash === this.password
}

const User = sequelize.define('user', {
    login: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    salt: {
        type: DataTypes.STRING(500),
    },
    password: {
        type: DataTypes.STRING(500),
    },
    refresh_token: {
        type: DataTypes.STRING(500),
        unique: true
    },
}, {
    timestamps: false,
})

User.prototype.generateSalt = generateSalt
User.prototype.generatePassword = generatePassword
User.prototype.setPassword = setPassword
User.prototype.checkPassword = checkPassword

module.exports = sequelize.model('user')