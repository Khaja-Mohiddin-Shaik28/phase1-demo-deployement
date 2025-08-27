const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require("cookie-parser");
const path = require('path');

// Router import
const loginRegisterRouter = require("./router/loginRegisterRoute");

// Allowed origins for CORS
const allowedOrigins = [
    'http://localhost:5173',                       // local dev
    'https://phase1-demo-deployement-1.onrender.com' // deployed frontend
];

app.use(cors({
    origin: function(origin, callback){
        if(!origin) return callback(null, true); // allow Postman / server requests
        if(allowedOrigins.includes(origin)){
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API routes
app.use("/api", loginRegisterRouter);

// Serve React frontend build (production)
if (process.env.NODE_ENV === "production") {
    const frontendBuildPath = path.join(__dirname, "../frontend/build");
    app.use(express.static(frontendBuildPath));

    app.get("*", (req, res) => {
        res.sendFile(path.join(frontendBuildPath, "index.html"));
    });
}

// Connect to MongoDB and start server
const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.dbURL);
        console.log("✅ Connected to MongoDB");

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
    }
}
dbConnection();
