const express = require("express");
const router = express.Router();
const Candidate = require("./../models/Candidate");
const User = require("../models/User");
const { jwtAuthMiddleware} = require("./../jwt");

const isAdmin = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (user.role === "admin") return true;
    else return false;
  } catch (err) {
    console.log(err);
    return false;
  }
};

router.post("/",jwtAuthMiddleware, async (req, res) => {
  try {
    const data = req.body;

    if (!(await isAdmin(req.user.id)))
      return res
        .status(403)
        .json({ message: "User is not authorized to perform any action" });
    const newCandidate = new Candidate(data);
    const response = await newCandidate.save();

    //Debugging
    console.log("dataSaved");
    res.status(200).json({ response });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:candidateId",jwtAuthMiddleware, async (req, res) => {
  try {
    const candidateId = req.params.candidateId;
    const data = req.body;
    if (!isAdmin(req.user.id))
      return res
        .status(403)
        .json({ message: "User is not authorized to perform any action" });

    const response = await Candidate.findByIdAndUpdate(candidateId, data, {
      new: true,
      runValidators: true,
    });

    //Debugging
    if (!response) {
      res.status(404).json({ message: "Candidate not found" });
    }

    console.log("DataUpdated");
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:candidateId",jwtAuthMiddleware, async (req, res) => {
  try {
    const candidateId = req.params.candidateId;
    if (!isAdmin(req.user.id))
      return res
        .status(403)
        .json({ message: "User is not authorized to perform any action" });

    const response = await Candidate.findByIdAndDelete(candidateId);

    //Debugging
    if (!response) {
      res.status(404).json({ message: "Candidate not found" });
    }

    console.log("DataDeleted");
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//noAdmin can vote
//only one user can vote
router.post("/vote/:candidateId", jwtAuthMiddleware,async (req, res) => {
  try {
    const candidateId = req.params.candidateId;
    const userId = req.user.id;
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      res.status(404).json({ message: "Candidate not found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.isVoted) {
      return res.status(400).json({ message: "User has already voted" });
    }
    if (user.role === "admin") {
      return res
        .status(403)
        .json({ message: "User is not authorized to perform any action" });
    }
    candidate.votes.push({user:userId})
    candidate.voteCount++;
    await candidate.save();

    user.isVoted=true;
    await user.save();
    res.status(200).json({message:"Vote recorded successfully"})
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get('/vote/count', async (req,res)=>{
  try {
    const candidate=await Candidate.find().sort({voteCount:'desc'})
    const record=candidate.map((data)=>{
      return {
        party: data.party,
        voteCount:data.voteCount
      }
    })
    res.status(200).json({ record: record})
    
  } catch (error) {
    console.log(error)
    res.status(500).json({error:'Internal Server Error'})
  }
})
module.exports = router;
