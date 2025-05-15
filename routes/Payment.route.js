const express = require('express');
const router = express.Router();
const payments = require('../controllers/payment.controllers');



router.post('/make-payment', payments.ProcessPayOut);


router.post('/confirm-payments', payments.ProcessPayOutFinal);




module.exports = router;