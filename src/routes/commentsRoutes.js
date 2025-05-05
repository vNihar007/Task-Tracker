const express = require('express');
const { addComment, getCommentsForTask } = require('/Users/varunnihar/Projects/AT/task-tracker-backend/src/controllers/commentsController.js');
const { verifyToken } = require("/Users/varunnihar/Projects/AT/task-tracker-backend/src/middlewear/authMiddlewear.js");

const router = express.Router();
router.post('/add/:taskId', verifyToken, addComment);
router.get('/view/:taskId', verifyToken, getCommentsForTask);

module.exports = router;
