module.exports = function (item) {
    return {
        'File name': item.filename,
        Extension: item.extension,
        'MIME type': item.mime_type,
        'Size(bytes)': item.size,
        'Upload date': item.upload_date.toLocaleString()
    }
}