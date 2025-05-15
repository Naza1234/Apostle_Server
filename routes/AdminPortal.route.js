const express = require('express');
const router = express.Router();
const controller = require('../controllers/AdminPortal.controller');


router.get('/get-summary', controller.getSummaryStats);


router.post('/get-financial-summary', controller.getRentalFinancialSummary);


router.post('/get-rental-details', controller.getUserInfoWithPin);


router.post('/get-rental-details-for-reserve', controller.getUserInfoWithPinFromReserve);






module.exports = router;