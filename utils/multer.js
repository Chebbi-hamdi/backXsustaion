// multer.js

const multer = require('multer');

// Configuration multer pour le téléchargement de plusieurs fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Définir le nom de fichier pour chaque fichier téléchargé
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

// Configurer multer pour le téléchargement de plusieurs fichiers
const upload = multer({ storage: storage, fileFilter: fileFilter }); // 'files' est le nom du champ de fichier dans votre formulaire, 10 est le nombre maximum de fichiers autorisés

module.exports = upload;
