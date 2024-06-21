const express = require('express');
const router = express.Router();

const  captchaController  = require('../../controllers/captcha.controller');

router.post('/verify', captchaController.verifyCaptcha);

module.exports = router;