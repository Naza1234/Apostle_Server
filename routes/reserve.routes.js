const express = require('express');
const router = express.Router();
const reserveController = require('../controllers/reserve.controller');

// Create a new reserve
router.post('/', reserveController.createReserve);

// Get all reserves
router.get('/:page', reserveController.getAllReserves);

// Get reserves by user ID
router.get('/user/:userId', reserveController.getReservesByUser);

// Update a reserve
router.put('/:id', reserveController.updateReserve);

// Delete a reserve
router.delete('/:id', reserveController.deleteReserve);

module.exports = router;
