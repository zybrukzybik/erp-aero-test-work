require('dotenv').config({path: require('path').join(__dirname, '..', '.env')})

const mysql = require('mysql2')

const {db_name, db_host} = require('../config').db.mysql

const connection = mysql.createConnection({
    host: db_host,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
}).promise()

async function dropDB(connection, dbName) {
    try {
        await connection.query(`DROP DATABASE ${dbName}`)

        console.log(`DB ${dbName} dropped`)

        connection.end()
    } catch (err) {
        console.log(err)
    }
}

dropDB(connection, db_name)