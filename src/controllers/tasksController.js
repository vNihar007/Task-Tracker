const {PrismaClient} = require('/Users/varunnihar/Projects/AT/task-tracker-backend/generated/prisma');
const prisma = new PrismaClient();
const { emitNotification } = require("/Users/varunnihar/Projects/AT/task-tracker-backend/src/Utils/socket.js");


const createTask = async (req, res) => {
    const userId = req.user.id;
    const { title, description, dueDate, assignedTo, projectId } = req.body;
  
    try {
      // 1. Check if project exists
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });
  
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
  
      // 2. Check if user is creator
      const isCreator = project.creatorId === userId;
  
      // 3. Check if user is member
      const isMember = await prisma.projectMember.findFirst({
        where: { projectId, userId },
      });
  
      if (!isCreator && !isMember) {
        return res.status(403).json({ message: 'Not a member of the Project' });
      }
  
      // 4. (Optional) Check if assignee is a member of the project
      if (assignedTo) {
        const assignee = await prisma.projectMember.findFirst({
          where: { projectId, userId: assignedTo },
        });
        if (!assignee) {
          return res.status(400).json({ message: 'Assignee is not a project member' });
        }
      }
      // 5. Create Task
      const newTask = await prisma.task.create({
        data: {
          title,
          description,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          status: 'Open',
          creatorId: userId,
          assignedTo: assignedTo || null,
          projectId,
        },
      });
      if (assignedTo) {
        emitNotification(assignedTo, {
          type: "task-assigned",
          message: `You've been assigned a new task: "${title}"`,
          taskId: newTask.id
        });
      }
    // socket emits notification to the front end
      return res.status(201).json({ message: 'Task created successfully', task: newTask });
    } catch (err) {
      console.error('createTask error:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };

const viewTasks = async (req, res) => {
    const userId = req.user.id;
    const projectId = parseInt(req.params.projectId);
  
    if (!projectId || isNaN(projectId)) {
      return res.status(400).json({ message: 'Invalid or missing project ID' });
    }
  
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });
  
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
  
      const isCreator = project.creatorId === userId;
  
      const isMember = await prisma.projectMember.findFirst({
        where: { projectId, userId }
      });
  
      if (!isCreator && !isMember) {
        return res.status(403).json({ message: 'Forbidden: Not a project member' });
      }
  
      const tasks = await prisma.task.findMany({
        where: { projectId },
        include: {
          assignee: { select: { id: true, name: true } },
          comments: true,
          attachments: true
        }
      });
  
      return res.status(200).json({ tasks });
  
    } catch (error) {
      console.error("viewTasks error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

const updateTask = async (req, res) => {
    const taskId = parseInt(req.params.taskId);
    const userId = req.user.id;
    const { title, description, dueDate, status, assignedTo } = req.body;
  
    if (!taskId || isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid or missing task ID' });
    }
  
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { project: true },
      });
  
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
  
      // Check if the user is creator or admin of the project
      const isCreator = task.creatorId === userId;
  
      const isAdmin = await prisma.projectMember.findFirst({
        where: {
          projectId: task.projectId,
          userId: userId,
          role: 'Admin',
        },
      });
  
      if (!isCreator && !isAdmin) {
        return res.status(403).json({ message: 'Unauthorized to update this task' });
      }
  
      // Prepare the update data
      const updateData = {};
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (dueDate) updateData.dueDate = new Date(dueDate);
      if (status) updateData.status = status;
      if (assignedTo) updateData.assignedTo = assignedTo;
  
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: updateData,
      });
      
      if (assignedTo && assignedTo !== task.assignedTo) {
        emitNotification(assignedTo, {
          type: "task-updated",
          message: `You've been assigned a task: "${updatedTask.title}"`,
          taskId: taskId
        });
      } else {
        emitNotification(task.creatorId, {
          type: "task-updated",
          message: `Task "${updatedTask.title}" was updated.`,
          taskId: taskId
        });
      }
  
      return res.status(200).json({
        message: 'Task updated successfully',
        task: updatedTask,
      });
    } catch (err) {
      console.error('updateTask error:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
const deleteTask = async (req, res) => {
    const taskId = parseInt(req.params.id);
    const requesterId = req.user.id;
  
    if (!taskId || isNaN(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }
  
    try {
      // Step 1: Fetch the task
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          project: {
            include: {
              members: true
            }
          }
        }
      });
  
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      // Step 2: Authorization check
      const isCreator = task.creatorId === requesterId;
      const isAdmin = task.project.members.some(
        (member) => member.userId === requesterId && member.role === "Admin"
      );
  
      if (!isCreator && !isAdmin) {
        return res.status(403).json({ message: "Unauthorized to delete this task" });
      }
  
      // Step 3: Delete the task
      await prisma.task.delete({
        where: { id: taskId },
      });
  
      return res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Delete Task Error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
};

const searchTasks = async (req, res) => {
    const userId = req.user.id;
    const { query } = req.query;
  
    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }
  
    try {
      const tasks = await prisma.task.findMany({
        where: {
          AND: [
            {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } }
              ]
            },
            {
              OR: [
                { creatorId: userId },
                { assignedTo: userId }
              ]
            }
          ]
        },
        select: {
          id: true,
          title: true,
          description: true,
          dueDate: true,
          status: true,
          projectId: true,
          creatorId: true,
          assignedTo: true
        }
      });
  
      return res.status(200).json({ tasks });
    } catch (error) {
      console.error("searchTasks error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
};
  

module.exports = {createTask,viewTasks,updateTask,deleteTask,searchTasks};