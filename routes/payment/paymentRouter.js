const express = require('express');
const router = express.Router();

const paymentController = require('../../controllers/payment.controller');

router.post('/', paymentController.Add);
router.post('/:id', paymentController.verifyPayment);


module.exports = router;