// server/__tests__/setup.js
// Runs once before ALL test files — connects to test DB

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

// Use a separate test database — never pollute development data
const TEST_DB =
  process.env.MONGODB_URI_TEST || "mongodb://localhost:27017/healthbot_test";

beforeAll(async () => {
  await mongoose.connect(TEST_DB);
});

afterAll(async () => {
  // Clean up all test collections then disconnect
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  await mongoose.connection.close();
});
