const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController');
const adminauthmiddleware = require('../middleware/adminAuthMiddleware');

// Anyone can view active categories.
router.get('/', categoryController.getAllCategories);

// Only Super Admin can create categories.
router.post('/', adminauthmiddleware, categoryController.createCategory);

module.exports = router;
