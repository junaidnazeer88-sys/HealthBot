const express = require("express");
const router = express.Router();

// Static disease data — in Phase 4 this comes from MongoDB
const DISEASES = [
  {
    id: 1,
    name: "Common Cold",
    category: "Viral",
    symptoms: ["runny nose", "sore throat", "cough", "sneezing", "mild fever"],
    selfCare: ["Rest", "Stay hydrated", "Saline nasal drops", "Warm fluids"],
    whenToSeeDoctor: "If symptoms last more than 10 days or fever exceeds 39°C",
    severity: "SELF-CARE",
  },
  {
    id: 2,
    name: "Influenza",
    category: "Viral",
    symptoms: ["high fever", "body aches", "fatigue", "headache", "cough"],
    selfCare: ["Bed rest", "Plenty of fluids", "Paracetamol for fever"],
    whenToSeeDoctor: "If breathing difficulty or fever above 40°C for 3+ days",
    severity: "ROUTINE",
  },
  {
    id: 3,
    name: "Migraine",
    category: "Neurological",
    symptoms: [
      "one-sided headache",
      "nausea",
      "light sensitivity",
      "throbbing pain",
    ],
    selfCare: ["Rest in dark room", "Cold compress", "Stay hydrated"],
    whenToSeeDoctor:
      "If worst headache of your life or with fever and stiff neck",
    severity: "ROUTINE",
  },
];

const FIRST_AID = [
  {
    id: 1,
    type: "Severe Bleeding",
    steps: [
      "Apply direct pressure with clean cloth",
      "Keep pressure for 10-15 mins",
      "Elevate above heart if possible",
      "Do not remove cloth — add more on top",
    ],
    callAmbulance: "If bleeding does not slow after 15 minutes",
  },
  {
    id: 2,
    type: "Burns",
    steps: [
      "Remove from heat source",
      "Cool under running water for 10-20 mins",
      "Do NOT use ice or butter",
      "Cover loosely with sterile bandage",
    ],
    callAmbulance: "If burn is larger than palm or on face/hands/genitals",
  },
  {
    id: 3,
    type: "Choking (Adult)",
    steps: [
      'Ask "Are you choking?"',
      "Give 5 firm back blows",
      "Give 5 abdominal thrusts (Heimlich)",
      "Repeat until dislodged or unconscious",
    ],
    callAmbulance: "Immediately if person becomes unconscious",
  },
];

// GET /api/health/diseases
router.get("/diseases", (req, res) => {
  res.json({ success: true, count: DISEASES.length, diseases: DISEASES });
});

// GET /api/health/diseases/:id
router.get("/diseases/:id", (req, res) => {
  const disease = DISEASES.find((d) => d.id === parseInt(req.params.id));
  if (!disease)
    return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, disease });
});

// GET /api/health/firstaid
router.get("/firstaid", (req, res) => {
  res.json({ success: true, count: FIRST_AID.length, procedures: FIRST_AID });
});

// GET /api/health/firstaid/:type
router.get("/firstaid/:type", (req, res) => {
  const proc = FIRST_AID.find((p) =>
    p.type.toLowerCase().includes(req.params.type.toLowerCase()),
  );
  if (!proc)
    return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, procedure: proc });
});
// Add the route logic
router.get("/diseases", (req, res) => {
  res.json({ success: true, diseases: DISEASES });
});

// THE MOST IMPORTANT LINE:
module.exports = router;
