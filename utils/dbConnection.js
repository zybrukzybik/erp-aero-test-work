require('dotenv').config({path: require('path').join(__dirname, '..', '.env')})

// const mysql = require('mysql2')
//
// const connection = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME
// }).promise()
//
// module.exports = connection

const {Sequelize} = require('sequelize')

const dbConnection = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        // logging: false
    })

module.exports = dbConnection