const express = require("express");
const router = express.Router();
const User = require('./../models/User');
const { jwtAuthMiddleware, generateToken } = require("./../jwt");




router.post("/signup", async (req, res) => {
  try {
    const data = req.body;
    const count=await User.countDocuments({role:data.role})
    console.log(count)
    if(count>=1){
      return res.status(401).json({error:'Only one Admin is allowed'})
    }
    const newUser = new User(data);
    const response = await newUser.save();
    //Debuggin
    console.log("Data is saved");

    //Generat a token
    const payload = {
      id: response.id,
    };

    //Debugging
    console.log(payload);

    const token = generateToken(payload);

    //Debugging
    console.log("Token is : ", token);

    res.status(200).json({ response: response, token: token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    //Get the user details
    const { adharCardNumber, password } = req.body;

    //Find the user is present or not
    const user = await User.findOne({ adharCardNumber: adharCardNumber });

    //Debugging
    console.log(user);

    //Check the user and password
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        error: "Invalid adharCardNumber and password",
      });
    }

    //Generate a token
    const payload = {
      id: user.id,
    };
    const token = generateToken(payload);

    //Debugging
    console.log(token);

    res.status(200).json({ token: token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/profile', jwtAuthMiddleware, async (req, res)=> {
    try{
        const userData=req.user;
        //Debugging
        console.log("User Data: ", userData);

        const userId=userData.id;

        //Debugging
        console.log("User Id: ", userId);

        const response=await User.findById(userId);
        res.status(200).json({response})


    }catch (err) {
        console.log(err)
        res.status(500).json({error:'Internal Server Error'})
    }
})


router.put('/profile/password',jwtAuthMiddleware,async (req, res) => {
    try{
        const userid=req.user; //Extract userid from token
        const {newPassword, password}=req.body;

        //check the user is present or not
        const user=await User.findById(userid);
        if(!(await user.comparePassword(password))){
            return res.status(400).json({error:'Invalid password'})
        }
        //update the password
        user.password=newPassword;
        await user.save();
        console.log('password saved')
        res.status(200).json({message:'Password updated successfully'})

    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Error'})
    }
})

module.exports = router;
