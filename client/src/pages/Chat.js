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

    // 1. Update UI with user message
    const newUserMessage = {
      role: "user",
      text: msgText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setTyping(true);

    try {
      // 2. Call the Flask API on Render
      const response = await fetch(`${BACKEND_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symptoms: msgText }),
      });

      if (!response.ok) throw new Error("Backend connection failed");

      const data = await response.json();

      // 3. Update UI with bot prediction
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text:
            data.prediction || data.message || "I have analyzed your input.",
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
          text: "I am having trouble reaching the medical server. It might be waking up—please try again in 30 seconds.",
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
        {/* Header Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            +
          </Box>
          <Box>
            <Typography fontWeight={600} fontSize={15}>
              HealthBot ML
            </Typography>
            <Typography fontSize={11} color="success.main">
              ● System Active (Cloud)
            </Typography>
          </Box>
          <Box sx={{ ml: "auto" }}>
            <Typography fontSize={12} color="text.secondary">
              {user?.name && `User: ${user.name.split(" ")[0]}`}
            </Typography>
          </Box>
        </Box>

        {/* Chat Message History */}
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
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  +
                </Box>
              )}
              <Box sx={{ maxWidth: "80%" }}>
                {msg.assessment?.severityLevel && (
                  <Chip
                    label={msg.assessment.severityLevel}
                    size="small"
                    sx={{
                      mb: 0.5,
                      fontSize: 10,
                      bgcolor: SEV_COLORS[msg.assessment.severityLevel] + "22",
                      color: SEV_COLORS[msg.assessment.severityLevel],
                    }}
                  />
                )}
                <Paper
                  elevation={0}
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    bgcolor:
                      msg.role === "user" ? "primary.main" : "background.paper",
                    color: msg.role === "user" ? "#fff" : "text.primary",
                    border: msg.role === "bot" ? "1px solid" : "none",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    fontSize={13}
                    dangerouslySetInnerHTML={{ __html: msg.text }}
                  />
                </Paper>
              </Box>
            </Box>
          ))}
          {typing && (
            <Typography
              fontSize={12}
              color="text.secondary"
              sx={{ ml: 4, fontStyle: "italic" }}
            >
              Bot is analyzing symptoms...
            </Typography>
          )}
          <div ref={bottomRef} />
        </Box>

        {/* Quick Suggestion Chips */}
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

        {/* Bottom Input Field */}
        <Box sx={{ pb: 1, bgcolor: "background.default" }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
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
              color="primary"
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
          <Typography
            fontSize={10}
            color="text.disabled"
            textAlign="center"
            mt={1}
          >
            This is an AI prototype — Always seek professional medical advice
            for emergencies.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
