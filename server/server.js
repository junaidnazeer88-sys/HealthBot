require("dotenv").config(); // Fixed: lowercase 'require' and standard path
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");

// 1. Import routes
const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");
const userRoutes = require("./routes/user.routes");
const healthRoutes = require("./routes/health.routes");
const facilityRoutes = require("./routes/facility.routes");

// 2. Import middleware & socket logic
const { errorMiddleware } = require("./middleware/error.middleware");
const chatSocket = require("./socket/chat.socket");

// Initialize App & Server
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// 3. Connect to Database
connectDB();

// 4. Global Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// --- Root Health Check ---
app.get("/api/health-check", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HealthBot server is healthy and running",
    timestamp: new Date().toISOString(),
  });
});

// 5. API Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/facilities", facilityRoutes);

// 6. Initialize Socket Handler (Only once!)
chatSocket(io);

// 7. Global Error Handler (Must be after routes)
app.use(errorMiddleware);

const PORT = process.env.PORT || 3001;
// server/server.js

// Only start the server if this file is run directly
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`🚀 HealthBot server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

// Export app for testing with supertest
module.exports = app;
