import React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Chip,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        borderBottom: "0.5px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", minHeight: 60 }}>
        {/* Logo */}
        <Link
          to="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              color: "#fff",
              fontWeight: 700,
            }}
          >
            +
          </Box>
          <Typography
            fontFamily="Space Mono, monospace"
            fontSize={15}
            fontWeight={700}
            color="text.primary"
          >
            HealthBot
          </Typography>
        </Link>

        {/* Nav links */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            component={Link}
            to="/firstaid"
            size="small"
            color="inherit"
            sx={{ fontSize: 13, color: "text.secondary" }}
          >
            First Aid
          </Button>
          <Button
            component={Link}
            to="/facilities"
            size="small"
            color="inherit"
            sx={{ fontSize: 13, color: "text.secondary" }}
          >
            Facilities
          </Button>

          {user ? (
            <>
              <Button
                component={Link}
                to="/chat"
                variant="contained"
                size="small"
                sx={{ fontSize: 13 }}
              >
                Open Chat
              </Button>
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  bgcolor: "primary.main",
                  fontSize: 11,
                  fontFamily: "Space Mono",
                  cursor: "pointer",
                }}
                onClick={handleLogout}
                title="Click to log out"
              >
                {getInitials(user.name)}
              </Avatar>
            </>
          ) : (
            <>
              <Button
                component={Link}
                to="/login"
                size="small"
                sx={{ fontSize: 13, color: "text.secondary" }}
              >
                Sign in
              </Button>
              <Button
                component={Link}
                to="/register"
                variant="contained"
                size="small"
                sx={{ fontSize: 13 }}
              >
                Get started
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
