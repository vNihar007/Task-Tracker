const { PrismaClient } = require("/Users/varunnihar/Projects/AT/task-tracker-backend/generated/prisma");
const prisma = new PrismaClient();
const { emitNotification } = require("/Users/varunnihar/Projects/AT/task-tracker-backend/src/Utils/socket.js");


// Add a comment to a task
const addComment = async (req, res) => {
  const taskId = parseInt(req.params.taskId);
  const userId = req.user.id;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Content is required" });
  }

  try {
    // Check if task exists
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId,
        userId
      },
    });
    emitNotification(task.creatorId, {
      type: "comment-added",
      message: `New comment added to "${task.title}" by ${user.name}`,
      taskId: task.id
    });
    
    if (task.assignedTo && task.assignedTo !== task.creatorId) {
      emitNotification(task.assignedTo, {
        type: "comment-added",
        message: `New comment on your task "${task.title}"`,
        taskId: task.id
      });
    }
    // socket emits notification to the front end
    return res.status(201).json(comment);
  } catch (error) {
    console.error("addComment error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all comments for a task
const getCommentsForTask = async (req, res) => {
  const taskId = parseInt(req.params.taskId);

  try {
    // Check if task exists
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comments = await prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(200).json(comments);
  } catch (error) {
    console.error("getCommentsForTask error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  addComment,
  getCommentsForTask,
};
