import React from "react";
import {
  Container,
  Typography,
  Button,
  Grid,
  Box,
  Paper,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ChatIcon from "@mui/icons-material/Chat";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import SearchIcon from "@mui/icons-material/Search";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      title: "Symptom Analysis",
      desc: "Describe symptoms in plain language",
      icon: <ChatIcon sx={{ fontSize: 45, color: "#4cc9f0" }} />,
    },
    {
      title: "ML Prediction",
      desc: "78% accurate disease prediction",
      icon: <MedicalServicesIcon sx={{ fontSize: 45, color: "#4cc9f0" }} />,
    },
    {
      title: "Emergency Triage",
      desc: "Instant red-flag detection",
      icon: <SearchIcon sx={{ fontSize: 45, color: "#4cc9f0" }} />,
    },
    {
      title: "First Aid",
      desc: "WHO-verified step-by-step guidance",
      icon: <LocalHospitalIcon sx={{ fontSize: 45, color: "#4cc9f0" }} />,
    },
  ];

  return (
    <Box
      sx={{ bgcolor: "#050c14", minHeight: "100vh", color: "white", pb: 10 }}
    >
      <Container maxWidth="lg">
        {/* HERO SECTION */}
        <Box
          sx={{
            pt: 15,
            pb: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 3,
              background: "linear-gradient(45deg, #fff 30%, #4cc9f0 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            AI-Powered Health Assistant
          </Typography>

          {/* Fixed the "Odd" Wrapping here */}
          <Typography
            variant="h5"
            sx={{ color: "#94a3b8", mb: 5, maxWidth: "800px", lineHeight: 1.6 }}
          >
            Preliminary symptom analysis and first-aid guidance — available 24/7
          </Typography>

          <Stack direction="row" spacing={3} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(user ? "/chat" : "/login")}
              sx={{
                bgcolor: "#4cc9f0",
                color: "#050c14",
                fontWeight: "bold",
                px: 5,
                py: 1.5,
                borderRadius: "12px",
              }}
            >
              GET STARTED
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/firstaid")}
              sx={{
                color: "#4cc9f0",
                borderColor: "#4cc9f0",
                px: 5,
                py: 1.5,
                borderRadius: "12px",
              }}
            >
              FIRST AID
            </Button>
          </Stack>
        </Box>

        {/* FEATURES GRID - EQUAL SQUARES */}
        <Grid container spacing={4} justifyContent="center">
          {features.map((f, i) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              key={i}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Paper
                elevation={0}
                sx={{
                  width: "260px", // Equal Width
                  height: "260px", // Equal Length (Breadth)
                  p: 3,
                  bgcolor: "#0d1f33",
                  borderRadius: 6,
                  border: "1px solid #1e293b",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center", // Centered horizontally
                  justifyContent: "center", // Centered vertically
                  textAlign: "center",
                  transition: "0.4s",
                  "&:hover": {
                    transform: "translateY(-10px)",
                    borderColor: "#4cc9f0",
                    boxShadow: "0 0 20px rgba(76, 201, 240, 0.2)",
                  },
                }}
              >
                <Box sx={{ mb: 2 }}>{f.icon}</Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: "white",
                    mb: 1.5,
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                  }}
                >
                  {f.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8", px: 1 }}>
                  {f.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
