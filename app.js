const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const dbConnection = require('./utils/dbConnection')
const errors = require('./utils/errors.js')

const signRouter = require('./routes/signRouter')
const fileRouter = require('./routes/fileRouter')
const {auth} = require('./controllers/signController')

const app = express()

app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(bodyParser())

app.use('/file', auth, fileRouter)
app.use('/', signRouter)

app.use((err, req, res, next) => {
    console.log(err)
    let status

    if (Object.keys(errors).includes(err.message)) {
        status = errors[err.message]
    }

    res
        .status(status || 500)
        .json({
            result: err.message
        })
})

app.listen(3000, () => {
    dbConnection.sync()
    console.log('Server started')
})