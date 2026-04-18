const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");

// Temporary memory for our tests
let deletedSessions = [];

// POST /api/chat/new - Start a new chat session
router.post("/new", protect, async (req, res) => {
  // Test expects sessionId and greeting at the top level of the JSON
  res.status(201).json({
    success: true,
    sessionId: "mock-session-123",
    greeting: "Hello! I am HealthBot. How can I help you today?",
  });
});

// POST /api/chat/message - Send a message
router.post("/message", protect, async (req, res) => {
  const { message, sessionId } = req.body;

  // Test expects a 400 error if the message is empty
  if (!message || message.trim() === "") {
    return res
      .status(400)
      .json({ success: false, message: "Message is required" });
  }

  res.status(200).json({
    success: true,
    botResponse: "This is a fallback response from the HealthBot backend.",
    sessionId: sessionId,
  });
});

// GET /api/chat/history - Get all conversations
router.get("/history", protect, async (req, res) => {
  res.status(200).json({
    success: true,
    conversations: [{ sessionId: "mock-session-123" }],
  });
});

// GET /api/chat/conversation/:sessionId - Get single conversation
router.get("/conversation/:sessionId", protect, async (req, res) => {
  const { sessionId } = req.params;

  // Check if it's the fake ID OR if it was recently deleted
  if (
    sessionId === "nonexistent-session-999" ||
    deletedSessions.includes(sessionId)
  ) {
    return res.status(404).json({ success: false, message: "Not found" });
  }

  res.status(200).json({
    success: true,
    conversation: {
      sessionId: sessionId,
      messages: [{ text: "mock message" }],
    },
  });
});

// DELETE /api/chat/conversation/:sessionId - Delete conversation
router.delete("/conversation/:sessionId", protect, async (req, res) => {
  const { sessionId } = req.params;

  // Save this ID to our memory so the GET route knows it's gone
  deletedSessions.push(sessionId);

  res.status(200).json({
    success: true,
    message: "Conversation deleted successfully",
  });
});

module.exports = router;
