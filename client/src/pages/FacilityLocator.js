import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Container,
  InputAdornment,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import StorefrontIcon from "@mui/icons-material/Storefront";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";

const SRINAGAR_FACILITIES = [
  {
    id: 1,
    name: "SMHS Hospital",
    type: "hospital",
    address: "Karan Nagar, Srinagar",
    phone: "0194-2452092",
    emergency: true,
  },
  {
    id: 2,
    name: "SKIMS Medical College",
    type: "hospital",
    address: "Bemina, Srinagar",
    phone: "0194-2400530",
    emergency: true,
  },
  {
    id: 3,
    name: "Medicare Pharmacy",
    type: "pharmacy",
    address: "Karan Nagar, Srinagar",
    phone: "0194-2482345",
    emergency: false,
  },
  {
    id: 4,
    name: "Max Medcentre Clinic",
    type: "clinic",
    address: "Hyderpora, Srinagar",
    phone: "0194-2435678",
    emergency: false,
  },
  {
    id: 5,
    name: "Lal Ded Hospital",
    type: "hospital",
    address: "Karan Nagar, Srinagar",
    phone: "0194-2452400",
    emergency: true,
  },
  {
    id: 6,
    name: "Crescent Pharmacy",
    type: "pharmacy",
    address: "Dalgate, Srinagar",
    phone: "0194-2471122",
    emergency: false,
  },
  {
    id: 7,
    name: "Quality Health Care Clinic",
    type: "clinic",
    address: "Jawahar Nagar, Srinagar",
    phone: "0194-2310099",
    emergency: false,
  },
];

export default function FacilityLocator() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [facilities, setFacilities] = useState(SRINAGAR_FACILITIES);

  useEffect(() => {
    let result = SRINAGAR_FACILITIES;
    if (filter !== "all") result = result.filter((f) => f.type === filter);
    if (search) {
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(search.toLowerCase()) ||
          f.address.toLowerCase().includes(search.toLowerCase()),
      );
    }
    setFacilities(result);
  }, [search, filter]);

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
      <Typography variant="h4" fontWeight="600" color="white" sx={{ mb: 1 }}>
        Facility locator
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: "#aaa" }}>
        Find nearby hospitals, clinics, and pharmacies in your area.
      </Typography>

      {/* Emergency Banner */}
      <Box
        sx={{
          p: 2,
          mb: 4,
          borderRadius: 2,
          bgcolor: "rgba(239, 68, 68, 0.1)",
          border: "0.5px solid rgba(239, 68, 68, 0.2)",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <LocalHospitalIcon sx={{ color: "#ef4444", fontSize: 20 }} />
        <Typography fontSize={14} color="white">
          <span style={{ color: "#ef4444", fontWeight: "bold" }}>
            Emergency?
          </span>{" "}
          Call 102 (Ambulance) or 112 immediately
        </Typography>
      </Box>

      {/* Search Section - Uses InputAdornment to fix the warning */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search Srinagar facilities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            bgcolor: "#1a1a1a",
            borderRadius: 1,
            input: { color: "white" },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#444" }} />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          sx={{ height: 56, px: 4, bgcolor: "#1976d2" }}
        >
          SEARCH
        </Button>
      </Box>

      {/* Filter Chips */}
      <Box sx={{ display: "flex", gap: 1, mb: 4 }}>
        {["all", "hospital", "clinic", "pharmacy"].map((type) => (
          <Chip
            key={type}
            label={type.toUpperCase()}
            onClick={() => setFilter(type)}
            color={filter === type ? "primary" : "default"}
            sx={{ color: "white", fontWeight: "bold", px: 1 }}
          />
        ))}
      </Box>

      {/* Map Fallback */}
      <Paper
        sx={{
          height: 300,
          bgcolor: "#1a1a1a",
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #333",
          mb: 4,
        }}
      >
        <LocalHospitalIcon sx={{ fontSize: 40, color: "#444", mb: 1 }} />
        <Typography variant="h6" color="#888">
          Map Unavailable
        </Typography>
        <Typography variant="caption" color="#555">
          Showing {filter} directory for Srinagar
        </Typography>
      </Paper>

      {/* List of Facilities */}
      <Grid container spacing={3}>
        {facilities.map((f) => (
          <Grid item xs={12} md={6} key={f.id}>
            <Card
              sx={{
                bgcolor: "#1a1a1a",
                color: "white",
                border: "1px solid #333",
                "&:hover": { borderColor: "primary.main" },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {/* Uses StorefrontIcon to fix the warning */}
                    {f.type === "pharmacy" ? (
                      <StorefrontIcon sx={{ color: "#4caf50" }} />
                    ) : f.type === "clinic" ? (
                      <MedicalServicesIcon sx={{ color: "#03a9f4" }} />
                    ) : (
                      <LocalHospitalIcon sx={{ color: "#ef4444" }} />
                    )}
                    <Typography variant="h6" fontWeight="bold">
                      {f.name}
                    </Typography>
                  </Box>
                  {f.emergency && (
                    <Chip label="24/7" size="small" color="error" />
                  )}
                </Box>
                <Typography variant="body2" color="#aaa" gutterBottom>
                  {f.address}
                </Typography>
                <Typography variant="body2" color="#aaa" sx={{ mb: 2 }}>
                  📞 {f.phone}
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/search/${encodeURIComponent(f.name + " " + f.address)}`,
                      "_blank",
                    )
                  }
                >
                  GET DIRECTIONS
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
