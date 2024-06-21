const multer = require('multer');
const path = require('path');

// Set The Storage Engine

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './public/images') // Destination folder
    },
    filename: function(req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)) // Naming the file
    }
  });
  

// Init Upload
const upload = multer({ storage: storage });

// // Check File Type
// function checkFileType(file, cb) {
//     // Allowed ext
//     const filetypes = /jpeg|jpg|png|gif/;
//     // Check ext
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     // Check mime
//     const mimetype = filetypes.test(file.mimetype);

//     if (mimetype && extname) {
//         return cb(null, true);
//     } else {
//         cb('Error: Images Only!');
//     }
// }

module.exports = upload;