const express = require("express");
const router = express.Router();

// Static local facilities — replace with Google Maps API later
const FACILITIES = [
  {
    id: 1,
    name: "SMHS Hospital",
    type: "hospital",
    address: "Karan Nagar, Srinagar, J&K",
    phone: "0194-2452092",
    emergency: true,
    lat: 34.0837,
    lng: 74.7973,
    services: ["Emergency", "Surgery", "ICU", "Cardiology"],
    hours: "24/7",
  },
  {
    id: 2,
    name: "SKIMS Medical College",
    type: "hospital",
    address: "Bemina, Srinagar, J&K",
    phone: "0194-2400530",
    emergency: true,
    lat: 34.0577,
    lng: 74.7522,
    services: ["Emergency", "Oncology", "Neurology", "Paediatrics"],
    hours: "24/7",
  },
  {
    id: 3,
    name: "Lal Ded Hospital",
    type: "hospital",
    address: "Karan Nagar, Srinagar, J&K",
    phone: "0194-2452400",
    emergency: true,
    lat: 34.0839,
    lng: 74.7975,
    services: ["Maternity", "Gynaecology", "Emergency"],
    hours: "24/7",
  },
];

// GET /api/facilities/nearby?type=hospital
router.get("/nearby", (req, res) => {
  const { type } = req.query;
  let results = FACILITIES;
  if (type) results = FACILITIES.filter((f) => f.type === type);
  res.json({ success: true, count: results.length, facilities: results });
});

// GET /api/facilities/search?q=SMHS
router.get("/search", (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ success: true, facilities: FACILITIES });
  const results = FACILITIES.filter(
    (f) =>
      f.name.toLowerCase().includes(q.toLowerCase()) ||
      f.address.toLowerCase().includes(q.toLowerCase()),
  );
  res.json({ success: true, count: results.length, facilities: results });
});

// GET /api/facilities/:id
router.get("/:id", (req, res) => {
  const facility = FACILITIES.find((f) => f.id === parseInt(req.params.id));
  if (!facility)
    return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, facility });
});
// Add the route logic
router.get("/nearby", (req, res) => {
  res.json({ success: true, facilities: FACILITIES });
});

// THE MOST IMPORTANT LINE:
module.exports = router;
