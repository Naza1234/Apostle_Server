const express = require('express');
const router = express.Router();
const controller = require('../controllers/LateReturnPrice.controller');

router.post('/', controller.createLateReturnPrice);
router.get('/', controller.getAllLateReturnPrices);
router.get('/:id', controller.getLateReturnPriceById);
router.put('/:id', controller.updateLateReturnPrice);

module.exports = router;
