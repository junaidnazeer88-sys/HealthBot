const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    symptoms: [
      {
        name: { type: String },
        severity: { type: Number, min: 1, max: 10 },
        duration: { type: String },
        location: { type: String },
      },
    ],
    predictedConditions: [
      {
        name: { type: String },
        confidence: { type: Number },
        description: { type: String },
      },
    ],
    severityLevel: {
      type: String,
      enum: ["EMERGENCY", "URGENT", "ROUTINE", "SELF-CARE"],
      required: true,
    },
    recommendations: [{ type: String }],
    redFlags: [{ type: String }],
  },
  { timestamps: true },
);

// Index: fast lookup of a user's assessment history
assessmentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Assessment", assessmentSchema);
