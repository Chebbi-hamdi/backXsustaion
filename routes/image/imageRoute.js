var express = require('express');
var router = express.Router();


const imageController = require('../../controllers/image.controller')

router.post('/', imageController.uploadImage);





module.exports = router;