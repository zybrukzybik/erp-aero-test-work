const fs = require('fs')
const {promisify} = require('util')
const multer = require('multer')

const {uploadPath} = require('../config')

const exists = promisify(fs.exists)

function getDestination(req, file, cb) {
    cb(null, '/dev/null')
}

function MyCustomStorage(opts) {
    this.getDestination = (opts.destination || getDestination)
}

MyCustomStorage.prototype._handleFile = function _handleFile(req, file, cb) {
    this.getDestination(req, file, async function (err, path) {
        if (err) return cb(err)

        const fileExists = await exists(path)

        if (req.method === 'POST' && fileExists) {
            const err = new Error('File already exists')
            return cb(err)
        }

        if (req.method === 'PUT' && !fileExists) {
            const err = new Error('File not exists')
            return cb(err)
        }

        const outStream = fs.createWriteStream(path)

        file.stream.pipe(outStream)
        outStream.on('error', cb)
        outStream.on('finish', function () {
            cb(null, {
                path: path,
                size: outStream.bytesWritten
            })
        })
    })
}

MyCustomStorage.prototype._removeFile = function _removeFile(req, file, cb) {
    fs.unlink(file.path, cb)
}

const storage = new MyCustomStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath + file.originalname)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const multerUpload = multer({storage: storage}).single('filedata')

module.exports = multerUpload
