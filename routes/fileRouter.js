const express = require('express')
const fileRouter = express.Router()
// const asyncHandler = require('express-async-handler')
const asyncHandler = function (callback) {
    return function (req, res, next) {
        callback(req, res, next)
            .catch(next)
    }
}

const multerUpload = require('../utils/multerUpload')
const {fileUpload, fileUpdate, fileList, fileInfo, fileDownload, fileDelete} = require('../controllers/fileController')
const {auth} = require('../controllers/signController')

fileRouter.post('/upload', asyncHandler(auth), asyncHandler(multerUpload), asyncHandler(fileUpload))
fileRouter.put('/update/:id', asyncHandler(auth), asyncHandler(multerUpload), asyncHandler(fileUpdate))
fileRouter.get('/list', asyncHandler(auth), asyncHandler(fileList))
fileRouter.get('/:id', asyncHandler(auth), asyncHandler(fileInfo))
fileRouter.get('/download/:id', asyncHandler(auth), asyncHandler(fileDownload))
fileRouter.delete('/delete/:id', asyncHandler(auth), asyncHandler(fileDelete))

module.exports = fileRouter