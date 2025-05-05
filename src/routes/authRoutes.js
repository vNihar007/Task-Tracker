const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const { verifyToken } = require("/Users/varunnihar/Projects/AT/task-tracker-backend/src/middlewear/authMiddlewear.js");

const router = express.Router();
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;
