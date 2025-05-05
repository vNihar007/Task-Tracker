const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const http = require("http");
const server = http.createServer(app);

// Middleware
app.use(express.json());

// Prisma Client
const { PrismaClient } = require("/Users/varunnihar/Projects/AT/task-tracker-backend/generated/prisma");
const prisma = new PrismaClient();

// Socket Setup
const { initSocket } = require("/Users/varunnihar/Projects/AT/task-tracker-backend/src/Utils/socket.js");
initSocket(server); // Initialize WebSocket once server is ready

// Routes Imports
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const commentsRoutes = require('./src/routes/commentsRoutes');
const attachmentRoutes = require('./src/routes/attachmentRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/task', taskRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/attachment', attachmentRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
