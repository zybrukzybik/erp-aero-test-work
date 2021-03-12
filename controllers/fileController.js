const path = require('path')
const fs = require('fs')
const {promisify} = require('util')

const {uploadPath} = require('../config')
const File = require('../Models/File')
const fileMapper = require('../mappers/fileMapper')

const deleteFile = promisify(fs.unlink)

const getFilename = filedata => path.basename(filedata.originalname, path.extname(filedata.originalname))
const getExtension = filedata => path.extname(filedata.originalname)

async function throwErrIfFileNotExistsInDbOrFS(req, res, next) {
    const reqFilename = req.params.id

    if (!reqFilename) return next(Error('Fill file name please'))

    const fileDB = await File.findOne({
            where: {filename: reqFilename}
        },
        {raw: true})

    if (!fileDB) return next(Error('File not found'))

    return {reqFilename: reqFilename, fileDB: fileDB}
}

async function fileUpload(req, res, next) {
    let filedata = req.file     //from multer

    await File.create({
        filename: getFilename(filedata),
        extension: getExtension(filedata),
        mime_type: filedata.mimetype,
        size: filedata.size,
        upload_date: Date.now()
    })

    res.json({
        result: `File upload success: <${filedata.originalname}>`
    })
}

async function fileUpdate(req, res, next) {
    const filedata = req.file     //from multer
    const reqFilename = req.params.id

    await File.update({
        filename: getFilename(filedata),
        extension: getExtension(filedata),
        mime_type: filedata.mimetype,
        size: filedata.size,
        upload_date: Date.now()
    }, {
        where: {filename: reqFilename}
    })

    res.json({
        result: `File update success: <${filedata.originalname}>`
    })
}

async function fileList(req, res, next) {
    const {list_size = 10, page = 1} = req.query

    let list = await File.findAll({
            offset: ((page - 1) * list_size),
            limit: Number(list_size),
            // order: [['filename', 'ASC']]
        },
        {raw: true}
    )

    list = list.map(fileMapper)
    res.json(list)
}

async function fileInfo(req, res, next) {
    const {fileDB} = await throwErrIfFileNotExistsInDbOrFS(req, res, next)

    res.json(fileMapper(fileDB))
}

async function fileDownload(req, res, next) {
    const {fileDB} = await throwErrIfFileNotExistsInDbOrFS(req, res, next)

    res.setHeader('Content-disposition', 'attachment; filename=' + fileDB.filename)
    res.setHeader('Content-type', fileDB.mime_type)

    res.download(uploadPath + fileDB.filename + fileDB.extension)
}

async function fileDelete(req, res, next) {
    const {reqFilename, fileDB} = await throwErrIfFileNotExistsInDbOrFS(req, res, next)

    await deleteFile(uploadPath + fileDB.filename + fileDB.extension)
    await File.destroy({where: {filename: reqFilename}})

    res.status(200).json({result: 'File deleted'})
}

module.exports = {
    fileUpload,
    fileUpdate,
    fileList,
    fileInfo,
    fileDownload,
    fileDelete
}