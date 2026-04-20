const axios = require("axios");

/**
 * Handles the symptom analysis by communicating with the Flask ML Service.
 * This function breaks the "loop" by providing real AI predictions.
 */
exports.sendMessage = async (req, res) => {
  try {
    const { message, history } = req.body;

    // Pulling the Cloud URL from your Render Environment Variables
    const ML_SERVICE_URL = process.env.ML_SERVICE_URL;

    if (!ML_SERVICE_URL) {
      throw new Error("ML_SERVICE_URL is not defined in environment variables");
    }

    // Sending the POST request to your Python /predict endpoint
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, {
      message: message,
      conversation_history: history || [],
    });

    // mlResponse.data contains 'response', 'assessment', and 'model_ready'
    return res.status(200).json(mlResponse.data);
  } catch (error) {
    console.error("Connection to ML Service failed:", error.message);

    // FALLBACK: If the Python server is down or the model isn't ready,
    // we send a helpful follow-up to keep the user engaged.
    return res.status(200).json({
      response:
        "I've noted your symptoms. To help me be more precise, could you tell me how many days you've been feeling this way?",
      assessment: null,
      model_ready: false,
    });
  }
};
