const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");

// POST /api/chat/new - Start a new chat session
router.post("/new", protect, async (req, res) => {
  try {
    // For now, we return a mock success. Later, you'll create a Conversation in MongoDB.
    res.status(201).json({
      success: true,
      message: "New chat session started",
      data: { sessionId: "mock-123", userId: req.user._id },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/chat/message - Send a message
router.post("/message", protect, async (req, res) => {
  const { message, sessionId } = req.body;
  res.status(200).json({
    success: true,
    reply: "This is a fallback response from the HealthBot backend.",
  });
});

module.exports = router;
