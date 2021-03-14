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

async function truncateTable(connection, ...tablesArr) {
    try {
        for (let i = 0; i < tablesArr.length; i++) {
            await connection.query(`TRUNCATE TABLE ${tablesArr[i]}`)
            console.log(`Table ${tablesArr[i]} cleaned`)
        }

        connection.end()
    } catch (err) {
        console.log(err)
    }
}

async function deleteFilesFromDir(dir) {
    try {
        const files = await readdir(dir)

        for (let i = 0; i < files.length; i++) {
            await unlink(path.join(dir, files[i]))
        }

        console.log('Files deleted')
    } catch (err) {
        console.log(err)
    }
}

async function cleanAll() {
    await truncateTable(connection, 'users', 'files')
    await deleteFilesFromDir(fixUploadPath)
}

cleanAll()

