require('dotenv').config({path: require('path').join(__dirname, '..', '.env')})

const {db_name, db_host} = require('../config').db.mysql

const {Sequelize} = require('sequelize')

const dbConnection = new Sequelize(
    db_name,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        host: db_host,
        dialect: 'mysql',
    })

module.exports = dbConnection