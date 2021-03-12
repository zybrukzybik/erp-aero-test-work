require('dotenv').config({path: require('path').join(__dirname, '..', '.env')})

const fs = require('fs')
const path = require('path')
const mysql = require('mysql2')
const {promisify} = require('util')

const {db_name, db_host} = require('../config').db.mysql
const uploadPath = require('../config').uploadPath
const fixUploadPath = path.join(__dirname, '..', uploadPath)

const readdir = promisify(fs.readdir)
const unlink = promisify(fs.unlink)

const connection = mysql.createConnection({
    database: db_name,
    host: db_host,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
}).promise()

async function truncateTable(connection, tableName) {
    try {
        await connection.query(`TRUNCATE TABLE ${tableName}`)

        console.log(`Table ${tableName} cleaned`)

        connection.end()
    } catch (err) {
        console.log(err)
    }
}

async function deleteFilesFromDir(dir) {
    try {
        const files = await readdir(dir)

        files.forEach(async file => {
            await unlink(path.join(dir, file))
        })

        console.log('Files deleted')
    } catch (err) {
        console.log(err)
    }
}

truncateTable(connection, 'files')
deleteFilesFromDir(fixUploadPath)
