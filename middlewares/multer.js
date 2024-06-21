// multer.js

const multer = require('multer');

// Configuration multer for multiple file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Set the filename for each uploaded file
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.mimetype.match(/(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: fileFilter }); // 'files' is the name of the file field in your form, 10 is the maximum number of files allowed

module.exports = upload;