// server/__tests__/chat.test.js
// Tests for chat routes — start, send, history, delete

const request = require("supertest");
const app = require("../server");

let authToken = "";
let sessionId = "";

// Register + login before chat tests
beforeAll(async () => {
  const reg = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Chat Tester",
      email: `chat_${Date.now()}@healthbot.test`,
      password: "test1234",
    });
  authToken = reg.body.token;
});

// ── Start conversation ───────────────────────────────────────────
describe("POST /api/chat/new", () => {
  it("creates a new conversation and returns sessionId + greeting", async () => {
    const res = await request(app)
      .post("/api/chat/new")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.sessionId).toBeDefined();
    expect(typeof res.body.greeting).toBe("string");
    expect(res.body.greeting.length).toBeGreaterThan(10);

    sessionId = res.body.sessionId; // save for message tests
  });

  it("returns 401 without auth token", async () => {
    const res = await request(app).post("/api/chat/new");
    expect(res.status).toBe(401);
  });
});

// ── Send message ─────────────────────────────────────────────────
describe("POST /api/chat/message", () => {
  it("sends a message and receives a bot response", async () => {
    const res = await request(app)
      .post("/api/chat/message")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ message: "I have a headache", sessionId });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.botResponse).toBeDefined();
    expect(typeof res.body.botResponse).toBe("string");
    expect(res.body.botResponse.length).toBeGreaterThan(5);
    expect(res.body.sessionId).toBe(sessionId);
  });

  it("returns 400 when message is empty", async () => {
    const res = await request(app)
      .post("/api/chat/message")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ message: "", sessionId });

    expect(res.status).toBe(400);
  });

  it("returns 401 without token", async () => {
    const res = await request(app)
      .post("/api/chat/message")
      .send({ message: "hello", sessionId });
    expect(res.status).toBe(401);
  });
});

// ── Conversation history ─────────────────────────────────────────
describe("GET /api/chat/history", () => {
  it("returns array of conversations for the logged-in user", async () => {
    const res = await request(app)
      .get("/api/chat/history")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.conversations)).toBe(true);
    expect(res.body.conversations.length).toBeGreaterThan(0);
  });

  it("returns 401 without token", async () => {
    const res = await request(app).get("/api/chat/history");
    expect(res.status).toBe(401);
  });
});

// ── Get single conversation ──────────────────────────────────────
describe("GET /api/chat/conversation/:sessionId", () => {
  it("returns conversation with messages array", async () => {
    const res = await request(app)
      .get(`/api/chat/conversation/${sessionId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.conversation.sessionId).toBe(sessionId);
    expect(Array.isArray(res.body.conversation.messages)).toBe(true);
    expect(res.body.conversation.messages.length).toBeGreaterThan(0);
  });

  it("returns 404 for non-existent sessionId", async () => {
    const res = await request(app)
      .get("/api/chat/conversation/nonexistent-session-999")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });
});

// ── Delete conversation ──────────────────────────────────────────
describe("DELETE /api/chat/conversation/:sessionId", () => {
  it("deletes the conversation and returns success", async () => {
    const res = await request(app)
      .delete(`/api/chat/conversation/${sessionId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it("returns 404 after deletion", async () => {
    const res = await request(app)
      .get(`/api/chat/conversation/${sessionId}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });
});
