const express = require('express');
const router = express.Router();
const controller = require('../controllers/AdminPortal.controller');
const {upload} = require('../middleware/upload');

router.get('/get-summary', controller.getSummaryStats);


router.post('/get-financial-summary', controller.getRentalFinancialSummary);


router.post('/get-rental-details', controller.getUserInfoWithPin);


router.post('/get-rental-details-for-reserve', controller.getUserInfoWithPinFromReserve);


router.post('/upload-Video', upload.single('file'), controller.uploadVideo);


router.get('/get-Video', controller.GetVideo);



module.exports = router;