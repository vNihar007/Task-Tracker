const express  = require('express');
const { getUserProfileByUserId, updateUserDetails } = require('../controllers/userController');
const { verifyToken } = require("/Users/varunnihar/Projects/AT/task-tracker-backend/src/middlewear/authMiddlewear.js");

const router  = express.Router();

router.get('/profile/:id', verifyToken, getUserProfileByUserId);
router.put('/profile/:id', verifyToken, updateUserDetails);

module.exports = router;