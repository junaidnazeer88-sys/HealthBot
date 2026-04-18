// server/socket/chat.socket.js
// Socket.IO event handlers for real-time HealthBot chat
// Called once in server.js: chatSocket(io)

const axios = require("axios");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const Conversation = require("../models/Conversation");
const Assessment = require("../models/Assessment");
const User = require("../models/User");

module.exports = function chatSocket(io) {
  // ── Auth middleware for Socket.IO ──────────────────────────────
  // Runs before every connection — verifies JWT from handshake
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.split(" ")[1];

      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error("User not found"));

      socket.user = user; // attach user to every socket event
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.user;
    console.log(`Socket connected: ${user.name} (${socket.id})`);

    // ── join_room ──────────────────────────────────────────────
    // Client calls this to associate socket with a session
    socket.on("join_room", (sessionId) => {
      socket.join(sessionId);
      socket.currentSession = sessionId;
      console.log(`${user.name} joined session ${sessionId}`);
    });

    // ── send_message ───────────────────────────────────────────
    // Main event — user sends a symptom message
    socket.on("send_message", async (data) => {
      const { message, sessionId } = data;

      if (!message || !message.trim()) return;

      try {
        // 1. Save user message to MongoDB
        let conversation = await Conversation.findOne({
          sessionId,
          userId: user._id,
        });

        if (!conversation) {
          conversation = await Conversation.create({
            userId: user._id,
            sessionId: sessionId || uuidv4(),
            messages: [],
          });
        }

        conversation.messages.push({
          sender: "user",
          text: message,
          timestamp: new Date(),
        });

        // 2. Emit typing indicator immediately
        socket.emit("bot_typing", { typing: true });

        // 3. Call Flask ML API
        let botText = "";
        let assessment = null;

        try {
          const mlRes = await axios.post(
            `${process.env.FLASK_ML_URL}/predict`,
            { message, conversation_history: conversation.messages },
            { timeout: 5000 },
          );
          botText = mlRes.data.response;
          assessment = mlRes.data.assessment || null;
        } catch {
          botText = getFallback(message);
        }

        // 4. Save bot response to MongoDB
        conversation.messages.push({
          sender: "bot",
          text: botText,
          timestamp: new Date(),
        });

        if (assessment) {
          conversation.assessment = assessment;
          await Assessment.create({
            userId: user._id,
            conversationId: conversation._id,
            ...assessment,
          });
        }

        await conversation.save();

        // 5. Stop typing indicator
        socket.emit("bot_typing", { typing: false });

        // 6. Emit bot response to this socket
        socket.emit("bot_response", {
          message: botText,
          assessment: assessment,
          sessionId: conversation.sessionId,
          timestamp: new Date(),
        });
      } catch (err) {
        socket.emit("bot_typing", { typing: false });
        socket.emit("error_message", {
          message: "Something went wrong. Please try again.",
        });
        console.error("Socket message error:", err.message);
      }
    });

    // ── start_conversation ─────────────────────────────────────
    socket.on("start_conversation", async () => {
      const sessionId = uuidv4();
      const first = user.name?.split(" ")[0] || "there";
      const h = new Date().getHours();
      const gr =
        h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
      const greeting = `${gr}, ${first}! I'm HealthBot. How are you feeling today? Please describe your symptoms.`;

      try {
        const conv = await Conversation.create({
          userId: user._id,
          sessionId,
          messages: [{ sender: "bot", text: greeting, timestamp: new Date() }],
        });

        socket.join(sessionId);
        socket.currentSession = sessionId;

        socket.emit("conversation_started", { sessionId, greeting });
      } catch (err) {
        socket.emit("error_message", {
          message: "Could not start conversation.",
        });
      }
    });

    // ── disconnect ─────────────────────────────────────────────
    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${user.name} — ${reason}`);
    });
  });
};

function getFallback(message) {
  const m = message.toLowerCase();
  if (m.includes("chest") && (m.includes("pain") || m.includes("tight")))
    return "EMERGENCY: Chest pain can be serious. Call 102 immediately.";
  if (m.includes("headache"))
    return "I understand you have a headache. How severe is it on a scale of 1–10? Is it on one side or both?";
  if (m.includes("fever"))
    return "How high is your temperature and how long have you had it? Any chills or body aches?";
  if (m.includes("cough"))
    return "Is it a dry cough or with mucus? How long have you had it? Any breathlessness?";
  return "Thank you for sharing. How long have you had this, and on a scale of 1–10, how severe is it?";
}
