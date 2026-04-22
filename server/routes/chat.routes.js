const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  startNewConversation,
  sendMessage,
  getHistory,
  getConversation,
  deleteConversation,
} = require("../controllers/chatController");

// All chat features require the user to be logged in
router.use(protect);

// REAL Logic Routes (No more mock data)
router.post("/new", startNewConversation);
router.post("/message", sendMessage);
router.get("/history", getHistory);
router.get("/conversation/:sessionId", getConversation);
router.delete("/conversation/:sessionId", deleteConversation);

module.exports = router;
