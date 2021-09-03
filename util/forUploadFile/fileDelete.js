const fs = require('fs');
const {join} = require('path');

const filePath = join(__dirname, "../../public/images/");
const deleteFile = async (fileUrl) => {

    return new Promise((resolve, reject) => {
        fs.unlink(filePath + fileUrl, (err) => {
            if (err) {
               reject(new Error(err.message));
            } else {
                resolve(true);
            }
        })
    })
}



const deleteMultipleFile = async (filesUrl) => {
    await Promise.all(filesUrl.map(deleteFile))
    .then((result) => {
        console.log(result)
    })

    .catch((error) => {
        throw error
    });

    return true
}



module.exports = {
    deleteMultipleFile,
    deleteFile
  }
