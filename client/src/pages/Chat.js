import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  Chip,
  Container,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useAuth } from "../context/AuthContext";

const QUICK_REPLIES = [
  "I have a headache",
  "High fever",
  "Stomach pain",
  "Chest pain",
  "Cough",
  "Fatigue",
];

const SEV_COLORS = {
  EMERGENCY: "#ef4444",
  URGENT: "#f59e0b",
  ROUTINE: "#eab308",
  "SELF-CARE": "#22c55e",
};

// Your live Render backend URL
const BACKEND_URL = "https://healthbot-ml-api.onrender.com";

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const bottomRef = useRef(null);

  // Initial greeting message
  useEffect(() => {
    const greeting = {
      role: "bot",
      text: `Hello ${user?.name?.split(" ")[0] || "there"}! I am your HealthBot. Please describe your symptoms.`,
      timestamp: new Date(),
    };
    setMessages([greeting]);
  }, [user]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async (text) => {
    const msgText = text || input.trim();
    if (!msgText || typing) return;

    setInput("");
    setShowQuick(false);

    const newUserMessage = {
      role: "user",
      text: msgText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setTyping(true);

    try {
      const response = await fetch(`${BACKEND_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: msgText }),
      });

      if (!response.ok) throw new Error("Backend connection failed");

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          // Maps to the 'response' key from your Python backend logic
          text: data.response || "Analysis complete.",
          assessment: data.assessment,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Connection Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Trouble reaching the medical server. Please try again in 30 seconds.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <Box
      sx={{
        height: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        overflow: "hidden",
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          pt: 2,
          pb: 1,
        }}
      >
        {/* HEADER SECTION: Unified Green Theme */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
            px: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: "#2e7d32",
                animation: "pulse 2s infinite",
              }}
            />
            <Typography
              sx={{ color: "#2e7d32", fontWeight: "bold", fontSize: "0.85rem" }}
            >
              HealthBot ML | System Active
            </Typography>
          </Box>
          <Typography
            sx={{ color: "#2e7d32", fontWeight: "bold", fontSize: "0.85rem" }}
          >
            User: {user?.name || "Junaid Nazeer"}
          </Typography>
        </Box>

        {/* CHAT HISTORY */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            pr: 1,
            mb: 2,
          }}
        >
          {messages.map((msg, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                alignItems: "flex-end",
                gap: 1,
              }}
            >
              {msg.role === "bot" && (
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  +
                </Box>
              )}
              <Box sx={{ maxWidth: "80%" }}>
                {msg.assessment?.severityLevel && (
                  <Typography
                    sx={{
                      fontSize: "10px",
                      fontWeight: "bold",
                      color: SEV_COLORS[msg.assessment.severityLevel] || "#666",
                      mb: 0.5,
                      ml: 0.5,
                    }}
                  >
                    ● {msg.assessment.severityLevel}
                  </Typography>
                )}
                <Paper
                  elevation={0}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    bgcolor: msg.role === "user" ? "primary.main" : "#f5f5f5",
                    color: msg.role === "user" ? "#fff" : "#000",
                    border: msg.role === "bot" ? "1px solid" : "none",
                    borderColor: msg.assessment?.severityLevel
                      ? SEV_COLORS[msg.assessment.severityLevel]
                      : "#e0e0e0",
                  }}
                >
                  <Typography
                    fontSize={14}
                    dangerouslySetInnerHTML={{ __html: msg.text }}
                  />
                </Paper>
              </Box>
            </Box>
          ))}

          {/* TYPING INDICATOR: Bold Blue */}
          {typing && (
            <Typography
              sx={{
                ml: 6,
                mb: 2,
                color: "#1976d2",
                fontWeight: "bold",
                fontStyle: "italic",
                fontSize: "0.85rem",
              }}
            >
              ● HealthBot is analyzing symptoms...
            </Typography>
          )}
          <div ref={bottomRef} />
        </Box>

        {/* QUICK REPLIES */}
        {showQuick && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            {QUICK_REPLIES.map((q) => (
              <Chip
                key={q}
                label={q}
                onClick={() => sendMessage(q)}
                clickable
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        )}

        {/* INPUT & PROTOTYPE WARNING */}
        <Box sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Enter your health concern..."
            />
            <IconButton
              onClick={() => sendMessage()}
              disabled={!input.trim() || typing}
              sx={{
                bgcolor: "primary.main",
                color: "#fff",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>

          {/* PROTOTYPE WARNING: Bold Green Visibility */}
          <Typography
            sx={{
              color: "#2e7d32",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "0.75rem",
              letterSpacing: "0.5px",
            }}
          >
            THIS IS AN AI PROTOTYPE — Always seek professional medical advice
            for emergencies.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
