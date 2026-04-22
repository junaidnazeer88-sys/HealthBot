const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const Conversation = require("../models/Conversation");
const Assessment = require("../models/Assessment");

// ── POST /api/chat/new ──
exports.startNewConversation = async (req, res) => {
  try {
    const sessionId = uuidv4();
    const firstName = req.user.name?.split(" ")[0] || "there";

    const greeting = `Hello <strong>${firstName}</strong>! I am your HealthBot. Please describe your symptoms and I will help assess them.`;

    const conversation = await Conversation.create({
      userId: req.user._id,
      sessionId,
      messages: [{ sender: "bot", text: greeting, timestamp: new Date() }],
    });

    res
      .status(201)
      .json({ success: true, sessionId: conversation.sessionId, greeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/chat/message ──
exports.sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user._id;

    if (!message || !message.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message is required" });
    }

    let conversation = await Conversation.findOne({ sessionId, userId });
    if (!conversation) {
      conversation = await Conversation.create({
        userId,
        sessionId: sessionId || uuidv4(),
        messages: [],
      });
    }

    conversation.messages.push({
      sender: "user",
      text: message,
      timestamp: new Date(),
    });

    const recentHistory = conversation.messages.slice(-6).map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      text: m.text,
    }));

    let botResponse = "";
    let assessment = null;

    // Call Python ML Server
    try {
      const mlRes = await axios.post(
        `${process.env.FLASK_ML_URL}/predict`,
        {
          message,
          conversation_history: recentHistory,
          user_context: {
            age: req.user.age,
            gender: req.user.gender,
            bloodGroup: req.user.bloodGroup,
          },
        },
        { timeout: 8000 },
      );
      botResponse = mlRes.data.response;
      assessment = mlRes.data.assessment || null;
    } catch (mlError) {
      botResponse = getSmartFallback(message, recentHistory);
    }

    conversation.messages.push({
      sender: "bot",
      text: botResponse,
      timestamp: new Date(),
    });

    if (assessment) {
      conversation.assessment = assessment;
      try {
        await Assessment.create({
          userId,
          conversationId: conversation._id,
          ...assessment,
        });
      } catch (e) {
        console.warn("Assessment save failed");
      }
    }

    await conversation.save();
    res
      .status(200)
      .json({
        success: true,
        sessionId: conversation.sessionId,
        botResponse,
        assessment,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── History & Details ──
exports.getHistory = async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      sessionId: req.params.sessionId,
      userId: req.user._id,
    });
    res.status(200).json({ success: true, conversation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteConversation = async (req, res) => {
  try {
    await Conversation.findOneAndDelete({
      sessionId: req.params.sessionId,
      userId: req.user._id,
    });
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Smart Fallback Logic ──
function getSmartFallback(message, history = []) {
  const msg = message.toLowerCase().trim();
  if (
    msg.includes("chest") &&
    (msg.includes("pain") || msg.includes("pressure"))
  ) {
    return "🔴 EMERGENCY: Please seek medical help immediately. Chest pain can be serious.";
  }
  if (msg.includes("fever"))
    return "How long have you had the fever? Any chills or body aches?";
  if (msg.includes("headache"))
    return "On a scale of 1-10, how severe is the headache?";

  return "Could you describe your symptoms in more detail so I can help you better?";
}
