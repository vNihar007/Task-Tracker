const express = require("express");
const upload = require("/Users/varunnihar/Projects/AT/task-tracker-backend/src/middlewear/multerMiddlewear.js");
const { verifyToken } = require("/Users/varunnihar/Projects/AT/task-tracker-backend/src/middlewear/authMiddlewear.js");
const {uploadAttachment,getAttachmentsForTask,} = require("/Users/varunnihar/Projects/AT/task-tracker-backend/src/controllers/attachmentController.js");

const router = express.Router();

router.post("/:taskId", verifyToken, upload.single("file"), uploadAttachment); // Upload a file to a task
router.get("/:taskId", verifyToken, getAttachmentsForTask); // Get all attachments for a task

module.exports = router;
