require("dotenv").config({ path: "./.env" });
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");
const userRoutes = require("./routes/user.routes");
const healthRoutes = require("./routes/health.routes");
const facilityRoutes = require("./routes/facility.routes");
// Import middleware & socket
const { errorMiddleware } = require("./middleware/error.middleware");
const chatSocket = require("./socket/chat.socket");

// Initialize App
const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Connect to Database
connectDB();

// // Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// --- Root Health Check ---
// Added to resolve the 404 error during terminal testing
app.get("/api/health-check", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HealthBot server is healthy and running",
    timestamp: new Date().toISOString(),
  });
});

// // Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/facilities", facilityRoutes);

// // Socket.io initialization
chatSocket(io);

// // Global Error Handler
app.use(errorMiddleware);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 HealthBot server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});
