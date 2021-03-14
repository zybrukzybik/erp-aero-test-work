const express = require('express')
const fileRouter = express.Router()

const multerUpload = require('../utils/multerUpload')
const {fileUpload, fileUpdate, fileList, fileInfo, fileDownload, fileDelete} = require('../controllers/fileController')
const {auth} = require('../controllers/signController')

fileRouter.post('/upload', auth, multerUpload, fileUpload)
fileRouter.put('/update/:id', auth, multerUpload, fileUpdate)
fileRouter.get('/list', auth, fileList)
fileRouter.get('/:id', auth, fileInfo)
fileRouter.get('/download/:id', auth, fileDownload)
fileRouter.delete('/delete/:id', auth, fileDelete)

module.exports = fileRouter