const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController');
const adminauthmiddleware = require('../middleware/adminAuthMiddleware');

// Anyone can view active categories.
router.get('/', categoryController.getAllCategories);

// Only Super Admin can create categories.
router.post('/', adminauthmiddleware, categoryController.createCategory);
router.delete('/:id', adminauthmiddleware, categoryController.deleteCategory);
router.put('/:id', adminauthmiddleware, categoryController.updateCategory);

module.exports = router;
