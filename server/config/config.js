require("dotenv").config();

const config = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    googleApiKey: process.env.GOOGLE_API_KEY,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    corsOptions: {
        origin: process.env.NODE_ENV === "production"
            ? process.env.FRONTEND_URL
            : "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    }
};

module.exports = config; 