// server/routes/facility.routes.js  — UPDATED with Google Places API
// Falls back to static data if no API key set

const express = require("express");
const axios = require("axios");
const router = express.Router();

// Static fallback facilities — shown when no API key is set
const STATIC_FACILITIES = [
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
  {
    id: 4,
    name: "JLNM Hospital",
    type: "hospital",
    address: "Rainawari, Srinagar, J&K",
    phone: "0194-2459357",
    emergency: true,
    lat: 34.0953,
    lng: 74.8063,
    services: ["General Medicine", "Paediatrics", "Emergency"],
    hours: "24/7",
  },
  {
    id: 5,
    name: "CD Hospital",
    type: "hospital",
    address: "Karan Nagar, Srinagar, J&K",
    phone: "0194-2452398",
    emergency: false,
    lat: 34.0842,
    lng: 74.7968,
    services: ["Chest Diseases", "Pulmonology"],
    hours: "8am-8pm",
  },
];

// GET /api/facilities/nearby?lat=34.08&lng=74.79&type=hospital&radius=5000
router.get("/nearby", async (req, res) => {
  const { lat, lng, type = "hospital", radius = 5000 } = req.query;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  // Use Google Places API if key available and coords provided
  if (apiKey && apiKey !== "your_google_maps_api_key_here" && lat && lng) {
    try {
      const placeType = type === "pharmacy" ? "pharmacy" : "hospital";
      const url =
        "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
      const response = await axios.get(url, {
        params: {
          location: `${lat},${lng}`,
          radius,
          type: placeType,
          key: apiKey,
        },
      });

      const facilities = response.data.results.slice(0, 10).map((place, i) => ({
        id: i + 1,
        name: place.name,
        type: placeType,
        address: place.vicinity,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        emergency: place.types?.includes("hospital") || false,
        open_now: place.opening_hours?.open_now,
        rating: place.rating,
        place_id: place.place_id,
      }));

      return res.json({
        success: true,
        source: "google",
        count: facilities.length,
        facilities,
      });
    } catch (err) {
      console.error("Google Places API error:", err.message);
      // Fall through to static data
    }
  }

  // Static fallback
  let results = STATIC_FACILITIES;
  if (type) results = results.filter((f) => f.type === type);
  res.json({
    success: true,
    source: "static",
    count: results.length,
    facilities: results,
  });
});

// GET /api/facilities/search?q=SMHS
router.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ success: true, facilities: STATIC_FACILITIES });
  const results = STATIC_FACILITIES.filter(
    (f) =>
      f.name.toLowerCase().includes(q.toLowerCase()) ||
      f.address.toLowerCase().includes(q.toLowerCase()),
  );
  res.json({ success: true, count: results.length, facilities: results });
});

// GET /api/facilities/:id
// 2. Search Facilities (GET /api/facilities/search?q=SMHS)
router.get("/search", (req, res) => {
  const { q } = req.query;

  // Logic to filter your STATIC_FACILITIES array
  const results = STATIC_FACILITIES.filter((f) =>
    f.name.toLowerCase().includes(q?.toLowerCase() || ""),
  );

  res.json({
    success: true,
    count: results.length,
    facilities: results,
  });
});

// 3. Get Single Facility by ID
router.get("/:id", (req, res) => {
  const facility = STATIC_FACILITIES.find(
    (f) => f.id === parseInt(req.params.id),
  );
  if (!facility) {
    return res
      .status(404)
      .json({ success: false, message: "Facility not found" });
  }
  res.json({ success: true, data: facility });
});

// THE FIX: Must be "module", not "nodule"
module.exports = router;
