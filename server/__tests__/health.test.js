// server/__tests__/health.test.js
// Tests for health info and facility routes — public endpoints

const request = require("supertest");
const app = require("../server");

// ── Server health check ──────────────────────────────────────────
describe("GET /api/health-check", () => {
  it("returns server status", async () => {
    const res = await request(app).get("/api/health-check");
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/running/i);
  });
});

// ── Diseases ─────────────────────────────────────────────────────
describe("GET /api/health/diseases", () => {
  it("returns array of diseases", async () => {
    const res = await request(app).get("/api/health/diseases");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.diseases)).toBe(true);
    expect(res.body.diseases.length).toBeGreaterThan(0);
  });

  it("each disease has required fields", async () => {
    const res = await request(app).get("/api/health/diseases");
    const disease = res.body.diseases[0];
    expect(disease).toHaveProperty("name");
    expect(disease).toHaveProperty("symptoms");
    expect(disease).toHaveProperty("selfCare");
  });
});

describe("GET /api/health/diseases/:id", () => {
  it("returns a specific disease by id", async () => {
    const res = await request(app).get("/api/health/diseases/1");
    expect(res.status).toBe(200);
    expect(res.body.disease.id).toBe(1);
  });

  it("returns 404 for non-existent id", async () => {
    const res = await request(app).get("/api/health/diseases/9999");
    expect(res.status).toBe(404);
  });
});

// ── First aid ────────────────────────────────────────────────────
describe("GET /api/health/firstaid", () => {
  it("returns array of first-aid procedures", async () => {
    const res = await request(app).get("/api/health/firstaid");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.procedures)).toBe(true);
    expect(res.body.procedures.length).toBeGreaterThan(0);
  });

  it("each procedure has steps array", async () => {
    const res = await request(app).get("/api/health/firstaid");
    const proc = res.body.procedures[0];
    expect(proc).toHaveProperty("type");
    expect(Array.isArray(proc.steps)).toBe(true);
    expect(proc.steps.length).toBeGreaterThan(0);
  });
});

// ── Facilities ───────────────────────────────────────────────────
describe("GET /api/facilities/nearby", () => {
  it("returns list of facilities", async () => {
    const res = await request(app).get("/api/facilities/nearby");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.facilities)).toBe(true);
  });

  it("filters by type=hospital", async () => {
    const res = await request(app).get("/api/facilities/nearby?type=hospital");
    expect(res.status).toBe(200);
    res.body.facilities.forEach((f) => {
      expect(f.type).toBe("hospital");
    });
  });
});

describe("GET /api/facilities/search", () => {
  it("finds SMHS hospital by name", async () => {
    const res = await request(app).get("/api/facilities/search?q=SMHS");
    expect(res.status).toBe(200);
    expect(res.body.facilities.length).toBeGreaterThan(0);
    expect(res.body.facilities[0].name).toMatch(/SMHS/i);
  });

  it("returns empty array for unknown query", async () => {
    const res = await request(app).get(
      "/api/facilities/search?q=xyzunknown999",
    );
    expect(res.status).toBe(200);
    expect(res.body.facilities.length).toBe(0);
  });
});
