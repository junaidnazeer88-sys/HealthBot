const axios = require("axios");

exports.sendMessage = async (req, res) => {
  try {
    const { message, history } = req.body;
    const ML_URL = process.env.ML_SERVICE_URL;

    // 1. Call the Python ML Service
    const mlResponse = await axios.post(`${ML_URL}/predict`, {
      message: message,
      conversation_history: history,
    });

    // 2. Send the AI's diagnosis back to the Frontend
    res.json(mlResponse.data);
  } catch (error) {
    console.error("ML Service Error:", error.message);
    // Fallback if Python is down
    res.json({
      response:
        "I'm having trouble analyzing that. How long have you had these symptoms?",
      model_ready: false,
    });
  }
};
