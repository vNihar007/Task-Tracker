const express  = require("express");
const router = express.Router();
const {createTask,viewTasks,updateTask,deleteTask,searchTasks} = require("../controllers/tasksController");
const { verifyToken } = require("/Users/varunnihar/Projects/AT/task-tracker-backend/src/middlewear/authMiddlewear.js");

router.post('/create',verifyToken,createTask);
router.get('/view/:projectId',verifyToken,viewTasks);
router.put('/update/:taskId', verifyToken, updateTask);
router.delete('/delete/:id', verifyToken, deleteTask);
router.get('/search', verifyToken, searchTasks);

module.exports = router ;