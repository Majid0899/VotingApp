const jwt=require('jsonwebtoken');
require('dotenv').config;

const jwtAuthMiddleware=(req,res,next)=>{
    
    //Check the token is present or not
    const authorization=req.headers.authorization;
        if(!authorization) return res.status(401).json({error:'Token is not present!'})

    //Extract the token
    const token=req.headers.authorization.split(' ')[1];

    
    //For debuggin 
    console.log(token)

    //verify the token
    try {
        //Verify return the payload ---which is user details
        const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY);

        //Debugging
            console.log(decoded)

        req.user=decoded;
            console.log('req.user',decoded);
        
        next();
        
    } catch (error) {
        //Debugging
        console.log(error)
        res.status(401).json({error:"Invalid Token"})
        
    }
    
}

const generateToken=(userData)=>{
   return  jwt.sign(userData,process.env.JWT_SECRET_KEY,{expiresIn:30000})
}

module.exports={jwtAuthMiddleware,generateToken}