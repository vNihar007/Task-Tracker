const { PrismaClient } = require("/Users/varunnihar/Projects/AT/task-tracker-backend/generated/prisma");
const bcrypt = require('bcryptjs');
const { emitNotification } = require("/Users/varunnihar/Projects/AT/task-tracker-backend/src/Utils/socket.js");

const prisma = new PrismaClient();

// GET /users/:id - View own profile
const getUserProfileByUserId = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const loggedUserId = req.user.id;

    if (userId !== loggedUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true } // good practice
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("getUserProfileByUserId:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// PUT /users/:id - Update own profile
const updateUserDetails = async (req, res) => {
  try {
    const requestedId = parseInt(req.params.id);
    const loggedUserId = req.user.id;

    if (requestedId !== loggedUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, email, password } = req.body;
    const updatedData = {};

    if (name) updatedData.name = name;
    if (email) updatedData.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: requestedId },
      data: updatedData,
      select: { id: true, name: true, email: true } // never return password
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("updateUserDetails:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getUserProfileByUserId,
  updateUserDetails,
};
