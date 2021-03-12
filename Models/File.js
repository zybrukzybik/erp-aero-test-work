const {DataTypes} = require('sequelize')

const sequelize = require('../utils/dbConnection')

const File = sequelize.define('file', {
    filename: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    extension: {
        type: DataTypes.STRING
    },
    mime_type: {
        type: DataTypes.STRING
    },
    size: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    upload_date: {
        type: DataTypes.DATE,

    },
}, {
    timestamps: false
})

module.exports = sequelize.model('file')