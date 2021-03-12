const {DataTypes} = require('sequelize')

const sequelize = require('../utils/dbConnection')

const User = sequelize.define('user', {
    login: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    salt: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    },
    refresh_token: {
        type: DataTypes.STRING,
        unique: true
    },
}, {
    timestamps: false
})

module.exports = sequelize.model('user')