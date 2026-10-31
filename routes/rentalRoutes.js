const express = require('express');
const router = express.Router();

const rentalController = require('../controllers/rentalController');
const authMiddleware = require('../middleware/authMiddleware');

// Create rental request
router.post('/', authMiddleware, rentalController.createRental);

// Changes made here
router.get('/owner/requests', authMiddleware, rentalController.getOwnerRentalRequests);
router.patch('/:rentalId/approve', authMiddleware, rentalController.approveRentalRequest);
router.patch('/:rentalId/reject', authMiddleware, rentalController.rejectRentalRequest);

module.exports = router;
