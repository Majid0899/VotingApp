const mongoose=require('mongoose')
    //Define the mongodb connection url
    require('dotenv').config();
const mongoUrl=process.env.MONGO_URL;
    //Setup mongob connection
mongoose.connect(mongoUrl)
    // it defines a object which reponsible to perform action
const db=mongoose.connection;
    

//Define eventListener for database;

db.on('connected',()=>{
    console.log("Connected to Mongodb server")
})
db.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});
db.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
});


// export the connection
    module.exports=db;
