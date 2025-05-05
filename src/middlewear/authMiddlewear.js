const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const { PrismaClient } = require("/Users/varunnihar/Projects/AT/task-tracker-backend/generated/prisma");

const prisma = new PrismaClient();

const verifyToken = async(req,res,next)=>{
    let token ;
    // check for the authorization header 
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
        try{
            token = req.headers.authorization.split(' ')[1];
            //verify the token
            const decoded = jwt.verify(token,process.env.JWT_SECRET)
            // finds the user form the db 
            const user = await prisma.user.findUnique({where:{id:parseInt(decoded.id)}})
            if(!user){
               return res.status(401).json({message:"Unauthorized: User not found"})
            }
            req.user = user; 
            next();
        }catch(err){
            console.log(err);
            return res.status(401).json({message:"Unauthorized: Invalid token"}) ;

        }
    }else{
        return res.status(401).json({message:"Unauthorized: No token provided"})
    }

}

module.exports = {verifyToken}; 