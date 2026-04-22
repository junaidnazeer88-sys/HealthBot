import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

/* ── Design tokens — matches Chat.js dark theme ── */
const C = {
  bg: "#070d1a",
  surface: "#0d1829",
  surfaceHi: "#111f36",
  border: "rgba(255,255,255,0.08)",
  borderHi: "rgba(14,165,233,0.5)",
  accent: "#0ea5e9",
  green: "#22d3a5",
  text: "#e2e8f0",
  textMid: "#94a3b8",
  textDim: "#475569",
  errorRed: "#f87171",
};

/* ── Reusable dark text field ── */
function DarkField({ label, helperText, ...props }) {
  return (
    <TextField
      label={label}
      fullWidth
      size="small"
      variant="outlined"
      helperText={helperText}
      {...props}
      sx={{
        "& .MuiOutlinedInput-root": {
          bgcolor: C.surfaceHi,
          borderRadius: "10px",
          color: C.text,
          fontSize: 13.5,
          "& fieldset": { borderColor: C.border },
          "&:hover fieldset": { borderColor: "rgba(14,165,233,0.3)" },
          "&.Mui-focused fieldset": {
            borderColor: C.borderHi,
            boxShadow: `0 0 0 3px rgba(14,165,233,0.08)`,
          },
        },
        "& .MuiInputLabel-root": {
          color: C.textMid,
          fontSize: 13,
          "&.Mui-focused": { color: C.accent },
        },
        "& input": {
          color: `${C.text} !important`,
          "&::placeholder": { color: C.textDim, opacity: 1 },
        },
        "& .MuiFormHelperText-root": {
          color: C.textDim,
          fontSize: 11,
          ml: 0.5,
        },
        ...(props.sx || {}),
      }}
    />
  );
}

/* ── Reusable dark select — full label always visible ── */
function DarkSelect({ label, name, value, onChange, options }) {
  return (
    <FormControl fullWidth size="small">
      <InputLabel
        sx={{
          color: C.textMid,
          fontSize: 13,
          "&.Mui-focused": { color: C.accent },
        }}
      >
        {label}
      </InputLabel>
      <Select
        name={name}
        value={value}
        label={label}
        onChange={onChange}
        sx={{
          bgcolor: C.surfaceHi,
          borderRadius: "10px",
          color: C.text,
          fontSize: 13.5,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: C.border },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(14,165,233,0.3)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: C.borderHi,
            boxShadow: `0 0 0 3px rgba(14,165,233,0.08)`,
          },
          "& .MuiSvgIcon-root": { color: C.textMid },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              bgcolor: C.surfaceHi,
              border: `0.5px solid ${C.border}`,
              borderRadius: "10px",
              mt: 0.5,
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              "& .MuiMenuItem-root": {
                color: C.text,
                fontSize: 13.5,
                py: 1,
                "&:hover": { bgcolor: "rgba(14,165,233,0.1)" },
                "&.Mui-selected": {
                  bgcolor: "rgba(14,165,233,0.18)",
                  color: C.accent,
                  "&:hover": { bgcolor: "rgba(14,165,233,0.22)" },
                },
              },
            },
          },
        }}
      >
        {options.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {opt}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

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
      const res = await api.post("/auth/register", form);
      login(res.data.user, res.data.token);
      navigate("/chat");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        backgroundImage: `
        radial-gradient(ellipse at 15% 10%, rgba(14,165,233,0.07) 0%, transparent 55%),
        radial-gradient(ellipse at 85% 90%, rgba(34,211,165,0.05) 0%, transparent 55%)`,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 480,
          animation: "fadeUp .35s ease",
          "@keyframes fadeUp": {
            from: { opacity: 0, transform: "translateY(16px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
        }}
      >
        {/* ── Card ── */}
        <Box
          sx={{
            bgcolor: C.surface,
            border: `0.5px solid ${C.border}`,
            borderRadius: "20px",
            p: { xs: 3, sm: 4 },
            boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          }}
        >
          {/* ── Logo + heading ── */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "12px",
                flexShrink: 0,
                background: `linear-gradient(135deg, ${C.accent}, ${C.green})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 20px rgba(14,165,233,0.35)`,
              }}
            >
              <Typography
                sx={{
                  color: "#fff",
                  fontSize: 22,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                +
              </Typography>
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: C.text,
                  fontFamily: "'Space Mono', monospace",
                  lineHeight: 1.2,
                }}
              >
                Create account
              </Typography>
              <Typography sx={{ fontSize: 12, color: C.textMid, mt: 0.3 }}>
                Join HealthBot — it's free
              </Typography>
            </Box>
          </Box>

          {/* ── Error ── */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2.5,
                fontSize: 12,
                borderRadius: "10px",
                bgcolor: "rgba(248,113,113,0.1)",
                color: C.errorRed,
                border: `0.5px solid rgba(248,113,113,0.3)`,
                "& .MuiAlert-icon": { color: C.errorRed },
              }}
            >
              {error}
            </Alert>
          )}

          {/* ── Form ── */}
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={1.75}>
              {/* Full name */}
              <Grid item xs={12}>
                <DarkField
                  label="Full name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12}>
                <DarkField
                  label="Email address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </Grid>

              {/* Password */}
              <Grid item xs={12}>
                <DarkField
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  helperText="Minimum 6 characters"
                />
              </Grid>

              {/* Age — half */}
              <Grid item xs={12} sm={6}>
                <DarkField
                  label="Age"
                  name="age"
                  type="number"
                  value={form.age}
                  onChange={handleChange}
                  inputProps={{ min: 1, max: 120 }}
                />
              </Grid>

              {/* City — half */}
              <Grid item xs={12} sm={6}>
                <DarkField
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                />
              </Grid>

              {/* Gender — half — FULL LABEL VISIBLE */}
              <Grid item xs={12} sm={6}>
                <DarkSelect
                  label="Gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  options={["Male", "Female", "Other"]}
                />
              </Grid>

              {/* Blood Group — half — FULL LABEL VISIBLE */}
              <Grid item xs={12} sm={6}>
                <DarkSelect
                  label="Blood group"
                  name="bloodGroup"
                  value={form.bloodGroup}
                  onChange={handleChange}
                  options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]}
                />
              </Grid>

              {/* Submit */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  disabled={loading}
                  sx={{
                    mt: 0.5,
                    py: 1.4,
                    borderRadius: "10px",
                    fontSize: 13.5,
                    fontWeight: 700,
                    fontFamily: "'Space Mono', monospace",
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                    background: `linear-gradient(135deg, ${C.accent}, #0284c7)`,
                    color: "#fff",
                    boxShadow: `0 4px 16px rgba(14,165,233,0.35)`,
                    transition: "all .2s",
                    "&:hover": {
                      background: `linear-gradient(135deg, #38bdf8, ${C.accent})`,
                      boxShadow: `0 6px 24px rgba(14,165,233,0.5)`,
                      transform: "translateY(-1px)",
                    },
                    "&:disabled": {
                      background: C.surfaceHi,
                      color: C.textDim,
                      boxShadow: "none",
                    },
                  }}
                >
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* ── Sign in link ── */}
          <Typography
            sx={{
              textAlign: "center",
              mt: 2.5,
              fontSize: 13,
              color: C.textMid,
            }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: C.accent,
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Sign in
            </Link>
          </Typography>
        </Box>

        {/* ── Disclaimer ── */}
        <Typography
          sx={{
            textAlign: "center",
            mt: 2,
            fontSize: 10,
            color: C.textDim,
            fontFamily: "'Space Mono', monospace",
            letterSpacing: 0.3,
          }}
        >
          THIS IS AN AI PROTOTYPE — Always seek professional medical advice for
          emergencies.
        </Typography>
      </Box>
    </Box>
  );
}
