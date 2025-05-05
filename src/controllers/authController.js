const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();
const { PrismaClient } = require("/Users/varunnihar/Projects/AT/task-tracker-backend/generated/prisma");
const { generateToken } = require('../Utils/generateToken');
const prisma = new PrismaClient();
const { emitNotification } = require("/Users/varunnihar/Projects/AT/task-tracker-backend/src/Utils/socket.js");



const registerUser = async(req,res)=>{
try{
    const {name,email,password} = req.body;
    const existingUser = await prisma.user.findUnique({where:{email}})
    if(existingUser){
        return res.status(400).json({message:"User already exists"})
    }
    // hash password
    const hashedPassword = await bcrypt.hash(password,10);
    const user = await prisma.user.create({
        data:{
            name,
            email,
            password : hashedPassword,
        },
    })
    res.status(201).json({
        id:user.id,
        name:user.name,
        email:user.email,
    })
}catch(error){
    console.log(error)
    res.status(500).json({message:"Internal Server Error"})
}
};

const loginUser = async(req,res)=>{
    try{
        const{email,password} = req.body
        const user = await prisma.user.findUnique({where:{email}})
        if(!user){
            return res.status(401).json({message:"Invalid credentials"})
        }
        const isPasswordValid = await bcrypt.compare(password,user.password)
        if(!isPasswordValid){
            return res.status(401).json({message:"Invalid credentials"})
        }
        res.status(200).json({
            id:user.id,
            name:user.name,
            email:user.email,
            token:generateToken(user.id)
        })
    }catch(error){
        console.log(error)
        res.status(500).json({message:"Internal Server Error"})
    }
}

module.exports = {registerUser,loginUser};
