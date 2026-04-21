import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    bloodGroup: "",
    city: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/register", form);
      login(res.data.user, res.data.token);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      {/* Increased maxWidth to 650 so the dropdowns have physical room to render */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 650,
          border: "0.5px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="h5"
          fontFamily="Space Mono, monospace"
          fontWeight={700}
          mb={1}
        >
          Create account
        </Typography>
        <Typography color="text.secondary" fontSize={13} mb={3}>
          Join HealthBot — it's free
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, fontSize: 13 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* ROW 1: Name and Email */}
            <Grid item xs={6}>
              <TextField
                label="Full name*"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Email*"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                fullWidth
                size="small"
              />
            </Grid>

            {/* ROW 2: Password and Age */}
            <Grid item xs={6}>
              <TextField
                label="Password*"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                fullWidth
                size="small"
                helperText="Min 6 characters"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Age"
                name="age"
                type="number"
                value={form.age}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>

            {/* ROW 3: Gender (25%), Blood (25%), City (50%) */}
            <Grid item xs={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  name="gender"
                  value={form.gender}
                  label="Gender"
                  onChange={handleChange}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="blood-label">Blood</InputLabel>
                <Select
                  labelId="blood-label"
                  name="bloodGroup"
                  value={form.bloodGroup}
                  label="Blood"
                  onChange={handleChange}
                >
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                    (bg) => (
                      <MenuItem key={bg} value={bg}>
                        {bg}
                      </MenuItem>
                    ),
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{ mt: 1, py: 1.2, fontWeight: "bold" }}
              >
                {loading ? "Creating account..." : "CREATE ACCOUNT"}
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Typography
          fontSize={13}
          color="text.secondary"
          mt={2}
          textAlign="center"
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#0ea5e9",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
