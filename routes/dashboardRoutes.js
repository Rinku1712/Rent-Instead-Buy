const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboardController');

// Common Dashboard (Public API)
router.get('/common', dashboardController.getCommonDashboard);

module.exports = router;
