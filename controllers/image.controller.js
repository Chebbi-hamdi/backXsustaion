const multer = require('multer');
const path = require('path');
const upload = require('../middlewares/uploadImgMiddlwares');



const uploadImage = (req, res, next) => {
    upload.single('image')(req, res, function(err) {
      if (err) {
        console.error(err);
        return res.send(`Error when trying upload image: ${err}`);
      }
      if (req.file == undefined) {
        return res.send(`You must select a file.`);
      }
      console.log('======',req.file.filename)
      return res.send(req.file.filename);
    });
  }




module.exports = {
    uploadImage: uploadImage,
}