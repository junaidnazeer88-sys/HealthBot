const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const Conversation = require("../models/Conversation");
const Assessment = require("../models/Assessment");

// ── POST /api/chat/new ─────────────────────────────────────────
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

    res.status(201).json({
      success: true,
      sessionId: conversation.sessionId,
      greeting,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/chat/message ─────────────────────────────────────
exports.sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user._id;

    if (!message || !message.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message is required" });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({ sessionId, userId });
    if (!conversation) {
      conversation = await Conversation.create({
        userId,
        sessionId: sessionId || uuidv4(),
        messages: [],
      });
    }

    // Save user message
    conversation.messages.push({
      sender: "user",
      text: message,
      timestamp: new Date(),
    });

    // Build recent history (last 6 messages) for context
    const recentHistory = conversation.messages.slice(-6).map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      text: m.text,
    }));

    let botResponse = "";
    let assessment = null;

    // ── Call Flask ML API ────────────────────────────────────────
    try {
      const mlRes = await axios.post(
        `${process.env.FLASK_ML_URL}/predict`,
        {
          message,
          conversation_history: recentHistory,
          user_context: {
            age: req.user.age,
            gender: req.user.gender,
            knownConditions: req.user.knownConditions,
          },
        },
        { timeout: 8000 },
      );
      botResponse = mlRes.data.response;
      assessment = mlRes.data.assessment || null;
    } catch (mlError) {
      // Flask unavailable — use smart fallback
      console.warn("Flask ML unavailable:", mlError.message);
      botResponse = getSmartFallback(message, recentHistory);
    }

    // Save bot response
    conversation.messages.push({
      sender: "bot",
      text: botResponse,
      timestamp: new Date(),
    });

    // Save assessment if present
    if (assessment) {
      conversation.assessment = assessment;
      try {
        await Assessment.create({
          userId,
          conversationId: conversation._id,
          ...assessment,
        });
      } catch (e) {
        console.warn("Assessment save failed:", e.message);
      }
    }

    await conversation.save();

    res.status(200).json({
      success: true,
      sessionId: conversation.sessionId,
      botResponse,
      assessment,
      messageCount: conversation.messages.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/chat/history ──────────────────────────────────────
exports.getHistory = async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("sessionId messages assessment createdAt isActive")
      .limit(20);

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/chat/conversation/:sessionId ─────────────────────
exports.getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      sessionId: req.params.sessionId,
      userId: req.user._id,
    });

    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    res.status(200).json({ success: true, conversation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE /api/chat/conversation/:sessionId ──────────────────
exports.deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOneAndDelete({
      sessionId: req.params.sessionId,
      userId: req.user._id,
    });

    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    res.status(200).json({ success: true, message: "Conversation deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Smart fallback — avoids repeated questions ─────────────────
// Checks conversation history to avoid asking the same thing twice
function getSmartFallback(message, history = []) {
  const msg = message.toLowerCase().trim();
  const prev = history.map((h) => h.text?.toLowerCase() || "").join(" ");

  // ── Number / severity answer ─────────────────────────────────
  if (/^\d+$/.test(msg) || /^[1-9]|10$/.test(msg)) {
    const score = parseInt(msg, 10);
    if (score >= 8) {
      return "That sounds very severe. I strongly recommend seeing a doctor today or visiting urgent care. Are you experiencing any chest pain or difficulty breathing?";
    } else if (score >= 5) {
      return "Moderate severity. Please monitor closely — if symptoms worsen in the next 24 hours, see a doctor. Do you have any fever alongside this?";
    } else {
      return "That seems mild. Rest well, stay hydrated, and monitor your symptoms. Let me know if anything changes or worsens.";
    }
  }

  // ── Cough type answer ────────────────────────────────────────
  if (
    ["dry", "wet", "mucus", "phlegm", "productive", "blood"].some((w) =>
      msg.includes(w),
    )
  ) {
    if (msg.includes("blood")) {
      return "🔴 Coughing blood is a serious symptom. Please see a doctor immediately or call 102.";
    }
    // Only ask duration if not already asked in history
    if (!prev.includes("how long")) {
      return "Understood. How long have you had this cough — days or weeks? Any fever or shortness of breath?";
    }
    return "Thank you. Based on your symptoms, I recommend monitoring closely. Any chest tightness or wheezing?";
  }

  // ── Duration answer ──────────────────────────────────────────
  if (
    [
      "day",
      "days",
      "week",
      "weeks",
      "hour",
      "hours",
      "yesterday",
      "morning",
      "night",
    ].some((w) => msg.includes(w))
  ) {
    return "Thank you for sharing that. Given the duration, I recommend monitoring your symptoms. If you develop a fever above 38°C or difficulty breathing, please consult a doctor promptly.";
  }

  // ── Yes / No answers ─────────────────────────────────────────
  if (["yes", "no", "yeah", "nope", "yep", "nah"].includes(msg)) {
    return "I understand. Are there any other symptoms you are experiencing — for example, fever, body aches, nausea, or dizziness?";
  }

  // ── Primary symptoms ─────────────────────────────────────────
  if (
    msg.includes("chest") &&
    ["pain", "tight", "pressure", "hurt"].some((w) => msg.includes(w))
  ) {
    return "🔴 EMERGENCY: Chest pain or tightness can be serious. Please call 102 immediately or go to the nearest emergency room.";
  }
  if (["headache", "head ache", "migraine"].some((w) => msg.includes(w))) {
    return "I understand you have a headache. On a scale of 1–10, how severe is it? Is it on one side or both sides?";
  }
  if (
    ["fever", "temperature", "high temp", "burning up"].some((w) =>
      msg.includes(w),
    )
  ) {
    // Avoid repeating fever question if already asked
    if (prev.includes("how high is your temperature")) {
      return "How long have you had the fever? Any chills, body aches, or rash alongside it?";
    }
    return "How high is your temperature? And how long have you had the fever? Any chills or body aches?";
  }
  if (["cough", "coughing"].some((w) => msg.includes(w))) {
    return "Is it a dry cough or with mucus? How long have you had it? Any shortness of breath?";
  }
  if (
    ["stomach", "abdomen", "belly", "tummy", "cramp"].some((w) =>
      msg.includes(w),
    )
  ) {
    return "Where is the pain — upper, lower, or all over? Is it constant or does it come and go?";
  }
  if (
    ["tired", "fatigue", "exhausted", "weak", "no energy"].some((w) =>
      msg.includes(w),
    )
  ) {
    return "How long have you been feeling this way? Is it affecting your daily activities? Any fever or weight loss?";
  }
  if (
    ["nausea", "nauseous", "vomit", "throwing up", "sick"].some((w) =>
      msg.includes(w),
    )
  ) {
    return "How long have you felt nauseous? Did it start suddenly? Any fever or stomach pain alongside it?";
  }
  if (
    ["dizzy", "dizziness", "spinning", "lightheaded"].some((w) =>
      msg.includes(w),
    )
  ) {
    return "Is the dizziness constant or in episodes? Does it get worse when you stand up quickly?";
  }
  if (
    ["rash", "itch", "hives", "red spot", "skin"].some((w) => msg.includes(w))
  ) {
    return "Where on your body is the rash? Is it spreading? Any fever or recent contact with allergens?";
  }

  // ── Greetings ─────────────────────────────────────────────────
  if (
    [
      "hello",
      "hi",
      "hey",
      "good morning",
      "good evening",
      "good afternoon",
    ].some((w) => msg.includes(w))
  ) {
    return "Hello! I am HealthBot. Please describe your symptoms and I will help assess them.";
  }
  if (
    ["thank", "thanks", "okay", "ok", "alright"].some((w) => msg.includes(w))
  ) {
    return "You are welcome. Remember — always consult a qualified doctor for a proper diagnosis. Is there anything else you would like to describe?";
  }

  // ── Default ──────────────────────────────────────────────────
  return 'Could you describe your main symptom in more detail? For example: "I have had a headache and fever since yesterday." The more detail you give, the better I can help.';
}
