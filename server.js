const express=require('express');
const bodyParser=require('body-parser');
const db=require('./db');
const app=express();
require('dotenv').config();
const PORT=process.env.PORT || 5000;
app.use(bodyParser.json())

app.get('/',(req,res)=>{
    res.send('<h1>Welcome to our Voting Application</h1>')
});

//LogReq middleware
const logReq=(req, res, next)=>{
	console.log(`[${new Date().toLocaleString()}] Request made to : ${req.method} and ${req.originalUrl}`);
  next();
}

app.use(logReq);
//User Route
const userRoute=require('./route/userRoute')
app.use('/user',userRoute)

//Candidate Route
const candidateRoute=require('./route/candidateRoute')
app.use('/candidate',candidateRoute);

app.listen(PORT,()=>{
    console.log('Server is running on http://localhost:5000');
})
