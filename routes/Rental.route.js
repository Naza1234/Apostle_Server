const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/Rental.controller');

// Create a new rental
router.post('/', rentalController.createRental);

router.post('/for-reserve', rentalController.createRentalForReserve);


router.post('/end-rental-by-return', rentalController.ReturnRental);

// Get all rentals
router.get('/:page', rentalController.getAllRentals);

// Get all rentals
router.get('/history/:userId', rentalController.getRentalsByUserId);

router.get('/:id/rental-stats', rentalController.getUserRentalStats);

// Get overdue rentals
router.get('/overdue/:page', rentalController.getOverdueRentals);

router.get('/:userId/recent-rentals', rentalController.getPrioritizedRecentRentalsByUser);

router.get('/for/admin/today-rentals', rentalController.getPrioritizedRecentRentals);

// Get overdue rentals by userId
router.get('/overdue/:userId', rentalController.getOverdueRentalsByUser);

// Get active rentals
router.get('/active/:page', rentalController.getActiveRentals);

// Get active rentals by userId
router.get('/active-rentals/:userId', rentalController.getActiveRentalsByUser);

// Update a rental
router.put('/:id', rentalController.updateRental);

// Delete a rental
router.delete('/:id', rentalController.deleteRental);

// Return a rental (mark as returned)
router.post('/return/:id', rentalController.returnRental);

// Get user info and active rentals by PIN
router.post('/by-pin', rentalController.getUserAndActiveRentalsByPin);

module.exports = router;
