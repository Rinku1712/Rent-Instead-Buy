const express = require('express');
const router = express.Router();
const adminMiddlerware = require('../middleware/adminAuthMiddleware');
const adminController = require('../controllers/superAdminController');

router.post('/login', adminController.login);
router.get('/profile', adminMiddlerware, adminController.login);
module.exports = router;
