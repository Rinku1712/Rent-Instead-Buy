// Authentication API endpoints.
const express = require('express');
const { signupSchema, loginSchema } = require('../validation/authValidation');
const authControllers = require('../controllers/authController');
const { validate } = require('../middleware/validateRequest');
const router = express.Router();

router.post('/signup', validate(signupSchema), authControllers.signup);
router.post('/login', validate(loginSchema), authControllers.login);
module.exports = router;
