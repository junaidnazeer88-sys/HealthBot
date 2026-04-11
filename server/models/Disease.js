const mongoose = require("mongoose");

const diseaseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    symptoms: [{ type: String }],
    selfCare: [{ type: String }],
    whenToSeeDoctor: { type: String },
    severity: {
      type: String,
      enum: ["SELF-CARE", "ROUTINE", "URGENT", "EMERGENCY"],
      default: "ROUTINE",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Disease", diseaseSchema);
