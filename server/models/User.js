const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Biometric fields for HealthBot
    age: { type: Number },
    gender: { type: String },
    bloodGroup: { type: String },
    city: { type: String },
  },
  { timestamps: true },
);

// Hash password before saving to MongoDB
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("User", userSchema);
