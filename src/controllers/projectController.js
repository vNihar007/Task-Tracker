const { PrismaClient } = require("/Users/varunnihar/Projects/AT/task-tracker-backend/generated/prisma");
const prisma = new PrismaClient();
const { emitNotification } = require("/Users/varunnihar/Projects/AT/task-tracker-backend/src/Utils/socket.js");


const createProject = async(req,res)=>{
    const {name,description} = req.body; 
    const userId = req.user.id;
    if(!name || !description){
        return res.status(400).json({message:"Project name and description are required"})
    }
    try{
        //Create an Project
        const project = await prisma.project.create({
            data:{
                name,description,creatorId:userId,
                members :{create:{userId:userId,role: "Admin"}}
            },
            select:{
                id: true, 
                description: true,
                name: true,
                creatorId: true,
            }
        });
        return res.status(201).json(project);
    }catch(error){
        return res.status(500).json({message:"Internal Server Error"})
    }
}

const getProjects = async(req,res)=>{
    const userId = req.user.id; 
    try{
        //Projects created by user
        const createdProjects = await prisma.project.findMany({
            where:{
                creatorId: userId
            },
            select: {
                id: true,
                name: true,
                description: true,
                creatorId: true,
              }
        }); 
        const formattedCreated = createdProjects.map(project=>{
            return{
                id:project.id,
                name:project.name,
                description:project.description,
                creatorId:project.creatorId,
                role:"Admin" // as creator is admin
            }
        })
        // Projects which the user added to
        const addedProjcts = await prisma.projectMember.findMany({
            where:{
                userId,project:{NOT:{creatorId:userId}}
            },
            select: {
                role: true,
                project: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    creatorId: true
                  }
                }
              }
            });
        const formattedAdded = addedProjcts.map(project=>{
            return{
                id:project.project.id,
                name:project.project.name,
                description:project.project.description,
                creatorId:project.project.creatorId,
                role:project.role
            }
        })
        return res.status(200).json({createdProjects:formattedCreated,addedProjects:formattedAdded})
    }catch(error){
        return res.status(500).json({message:"Internal Server Error"})
    }
};

const addMembertoProject = async (req, res) => {
    const projectId = parseInt(req.params.id);
    const requesterId = req.user.id;
    const { userId, role = "Member", emailId } = req.body;
    if (!userId && !emailId) {
      return res.status(400).json({ message: "User ID or Email ID is required" });
    }
    try {
      // 1. Get the user to be added
      let targetUser;
      if (userId) {
        targetUser = await prisma.user.findUnique({
          where: { id: parseInt(userId) }
        });
      } else {
        targetUser = await prisma.user.findUnique({
          where: { email: emailId }
        });
      }
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      // 2. Check if project exists
      const project = await prisma.project.findUnique({
        where: { id: projectId }, // ✅ FIXED
        include: { members: true }
      });
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      // 3. Verify if requester is creator or admin
      const isCreator = project.creatorId === requesterId;
      const isAdmin = await prisma.projectMember.findFirst({
        where: {
          projectId,
          userId: requesterId,
          role: "ADMIN"
        }
      });
      if (!isCreator && !isAdmin) {
        return res.status(403).json({
          message: "Unauthorized: You are not authorized to add members to this project"
        });
      }
      // 4. Check if targetUser is already in the project
      const existingMember = project.members.find(
        member => member.userId === targetUser.id
      );
      if (existingMember) {
        return res.status(400).json({ message: "User already present in project" });
      }
      // 5. Add the user to the project
      const addedMember = await prisma.projectMember.create({
        data: {
          userId: targetUser.id,
          projectId,
          role
        }
      });
      emitNotification(userId, {
        type: "project-invite",
        message: `You've been added to the project "${project.name}"`,
        projectId: project.id
      });
      
      return res.status(201).json({
        message: `User ${targetUser.name} added to project successfully`,
        member: addedMember
      });
    }catch (error) {
      console.error("addMemberToProject error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

module.exports = {createProject,getProjects,addMembertoProject};