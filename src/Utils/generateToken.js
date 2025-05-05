const jwt  = require('jsonwebtoken')
const dotenv = require('dotenv');
dotenv.config();

function generateToken(userId){
    return jwt.sign({id: userId}, process.env.JWT_SECRET,
    {expiresIn: '7d'});
}

module.exports = {generateToken};

