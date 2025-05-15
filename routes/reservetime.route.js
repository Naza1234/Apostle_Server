const express = require('express');
const router = express.Router();
const controller = require('../controllers/ReserveTime.controller');

router.post('/', controller.createReserveTime);
router.get('/', controller.getAllReserveTimes);
router.get('/:id', controller.getReserveTimeById);
router.put('/:id', controller.updateReserveTime);

module.exports = router;
