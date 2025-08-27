const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require("cookie-parser");

// router import
const loginRegisterRouter = require("./router/loginRegisterRoute");


// CORS Setup
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials : true
}


app.use(cors(corsOptions))

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// Database Connection
dbConnection = async ()=>{
        await mongoose.connect(process.env.dbURL || "mongodb+srv://Test:1234@cluster0.oyxicni.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
        app.listen(process.env.PORT || 3000);
}
dbConnection();

app.use("/api",loginRegisterRouter)

