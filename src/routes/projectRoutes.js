const express = require('express');
const { createProject,getProjects,addMembertoProject} = require('../controllers/projectController');
const { verifyToken } = require("/Users/varunnihar/Projects/AT/task-tracker-backend/src/middlewear/authMiddlewear.js");

const router = express.Router();
router.post('/create', verifyToken, createProject);
router.get('/Info/',verifyToken,getProjects)
router.post('/:id/members/add', verifyToken, addMembertoProject);
module.exports = router;