const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require("cookie-parser");

// router import
const loginRegisterRouter = require("./router/loginRegisterRoute");

// CORS Setup
const allowedOrigins = [
    'https://phase1-demo-deployement-1.onrender.com',
    'http://localhost:5173'
];

app.use(cors({
    origin: function(origin, callback){
        if(!origin) return callback(null, true); // allow non-browser tools like Postman
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
// Serve React build
if (process.env.NODE_ENV === "production") {
    const frontendBuildPath = path.join(__dirname, "../frontend/dist");
    app.use(express.static(frontendBuildPath));

    // This handles React Router routes
    app.get("*", (req, res) => {
        res.sendFile(path.join(frontendBuildPath, "index.html"));
    });
}


// Routes
app.use("/api", loginRegisterRouter);

// Database Connection
const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.dbURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("✅ Connected to MongoDB");

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
        console.error("MongoDB connection error:", err);
    }
}
dbConnection();
