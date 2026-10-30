const express = require('express');
const router = express.Router();

const rentalController = require('../controllers/rentalController');
const authMiddleware = require('../middleware/authMiddleware');

// Create rental request
router.post('/', authMiddleware, rentalController.createRental);

module.exports = router;
