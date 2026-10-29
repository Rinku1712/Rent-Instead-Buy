// Item API endpoints.
const express = require('express');
const authmiddleware = require('../middleware/authMiddleware');
const itemController = require('../controllers/itemController');
const router = express.Router();

router.post('/', authmiddleware, itemController.createItem);
router.get('/', itemController.getAllItems);
router.get('/search', itemController.searchItems);
module.exports = router;
