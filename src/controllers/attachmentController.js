const path = require("path");
const { PrismaClient } = require("/Users/varunnihar/Projects/AT/task-tracker-backend/generated/prisma");
const prisma = new PrismaClient();
const { emitNotification } = require("/Users/varunnihar/Projects/AT/task-tracker-backend/src/Utils/socket.js");


// Upload attachment to a task
const uploadAttachment = async (req, res) => {
  const taskId = parseInt(req.params.taskId);
  const userId = req.user.id;

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    // Check if task exists
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const attachment = await prisma.attachment.create({
      data: {
        filename: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        taskId: taskId
      },
    });
    
    emitNotification(task.creatorId, {
      type: "file-attached",
      message: `A file "${req.file.originalname}" was attached to task "${task.title}"`,
      taskId: task.id
    });
    
    if (task.assignedTo) {
      emitNotification(task.assignedTo, {
        type: "file-attached",
        message: `A file "${req.file.originalname}" was attached to your task "${task.title}"`,
        taskId: task.id
      });
    }
    // socket emits notification to the front end
    return res.status(201).json({ message: "File uploaded", attachment });
  } catch (error) {
    console.error("uploadAttachment error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all attachments for a task
const getAttachmentsForTask = async (req, res) => {
  const taskId = parseInt(req.params.taskId);

  try {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const attachments = await prisma.attachment.findMany({
      where: { taskId },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json(attachments);
  } catch (error) {
    console.error("getAttachmentsForTask error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  uploadAttachment,
  getAttachmentsForTask,
};
