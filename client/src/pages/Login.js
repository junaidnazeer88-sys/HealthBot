import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, TextField, Button, Typography, Alert } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

/* ─── Design tokens (Matches Register/Chat) ───────────────────── */
const C = {
  bg: "#070d1a",
  surface: "#0d1829",
  surfaceHi: "#111f36",
  border: "rgba(255,255,255,0.08)",
  borderHi: "rgba(14,165,233,0.5)",
  accent: "#0ea5e9",
  text: "#e2e8f0",
  textMid: "#94a3b8",
};

/* ─── Reusable Dark Input Component ───────────────────────────── */
function DarkField({ label, ...props }) {
  return (
    <TextField
      label={label}
      fullWidth
      variant="outlined"
      size="small"
      {...props}
      sx={{
        "& .MuiOutlinedInput-root": {
          bgcolor: C.surfaceHi,
          borderRadius: "10px",
          color: C.text,
          fontSize: "14px",
          "& fieldset": { borderColor: C.border },
          "&:hover fieldset": { borderColor: "rgba(14,165,233,0.3)" },
          "&.Mui-focused fieldset": { borderColor: C.borderHi },
        },
        "& .MuiInputLabel-root": { color: C.textMid, fontSize: "13.5px" },
      }}
    />
  );
}

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
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
      const res = await api.post("/auth/login", form);
      login(res.data.user, res.data.token);
      navigate("/chat");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: C.bg, // Sets the whole page to dark blue
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Box
        sx={{
          p: 4.5,
          width: "100%",
          maxWidth: 400,
          bgcolor: C.surface, // The card color
          borderRadius: "20px",
          border: `1px solid ${C.border}`,
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: C.text,
            fontFamily: "'Space Mono', monospace",
            fontWeight: 700,
            mb: 1,
          }}
        >
          Sign in
        </Typography>
        <Typography sx={{ color: C.textMid, fontSize: 13, mb: 4 }}>
          Welcome back to HealthBot
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, fontSize: 13, borderRadius: "8px" }}
          >
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          <DarkField
            label="Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <DarkField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 1,
              bgcolor: C.accent,
              py: 1.4,
              borderRadius: "10px",
              fontWeight: 700,
              textTransform: "none",
              "&:hover": { bgcolor: "#0284c7" },
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </Box>

        <Typography
          fontSize={13}
          sx={{ color: C.textMid, mt: 3, textAlign: "center" }}
        >
          No account?{" "}
          <Link
            to="/register"
            style={{ color: C.accent, textDecoration: "none", fontWeight: 600 }}
          >
            Create one
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
