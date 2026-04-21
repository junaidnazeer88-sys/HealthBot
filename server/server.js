require("dotenv").config();
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

// --- CRITICAL ORDER CHANGE ---
// 1. Parser and CORS must come FIRST
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigin = process.env.CLIENT_URL || "http://localhost:3000";
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  }),
);

// 2. Security and Proxy
app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

const server = http.createServer(app);

// Initialize Socket.io
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 3. Connect to Database
connectDB();

// 4. API Routes
// --- Root Health Check ---
app.get("/api/health-check", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HealthBot server is healthy and running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/facilities", facilityRoutes);

// 5. Initialize Socket Handler
chatSocket(io);

// 6. Global Error Handler (MUST BE LAST)
app.use(errorMiddleware);

const PORT = process.env.PORT || 10000;

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`🚀 HealthBot server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

module.exports = { app, server };
