const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const cookieParser = require("cookie-parser");

// Router import
const loginRegisterRouter = require("./routes/loginRegisterRoute");

// ------------------- CORS Setup -------------------
const allowedOrigins = [
    'http://localhost:5173',                             // local dev
    'https://phase1-demo-deployement-1.onrender.com'     // deployed frontend
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin) return callback(null, true); // allow Postman / server requests
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// ------------------- Middlewares -------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ------------------- Health Check -------------------
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// ------------------- API Routes -------------------
app.use("/api", loginRegisterRouter);

// ------------------- Serve React Build -------------------
if (process.env.NODE_ENV === "production") {
    const frontendBuildPath = path.join(__dirname, "../frontend/dist");
    app.use(express.static(frontendBuildPath));
    
    // Handle React Router - FIXED: Use * instead of /*
    app.get("*", (req, res) => {
        // Don't serve index.html for API routes
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ error: 'API route not found' });
        }
        res.sendFile(path.join(frontendBuildPath, "index.html"));
    });
}

// ------------------- Error Handling Middleware -------------------
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// ------------------- 404 Handler -------------------
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ------------------- Database Connection -------------------
const dbConnection = async () => {
    try {
        const mongoOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            heartbeatFrequencyMS: 10000, // Send a ping every 10 seconds
        };

        await mongoose.connect(process.env.dbURL || process.env.MONGODB_URI, mongoOptions);
        console.log("✅ Connected to MongoDB");
        
        const PORT = process.env.PORT || 3000;
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM received, shutting down gracefully');
            server.close(() => {
                console.log('Process terminated');
                mongoose.connection.close();
            });
        });

    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error('Unhandled Promise Rejection:', err.message);
    process.exit(1);
});

dbConnection();

module.exports = app;
