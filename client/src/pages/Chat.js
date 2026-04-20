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
import { io } from "socket.io-client";
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

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [typing, setTyping] = useState(false);
  const [connected, setConnected] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("healthbot_token");

    const socket = io(
      process.env.REACT_APP_SOCKET_URL ||
        "https://healthbot-ml-api.onrender.com",
      {
        auth: { token },
        transports: ["websocket"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      },
    );

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("start_conversation");
    });

    socket.on("conversation_started", ({ sessionId: sid, greeting }) => {
      setSessionId(sid);
      setMessages([{ role: "bot", text: greeting, timestamp: new Date() }]);
    });

    socket.on("bot_typing", ({ typing: t }) => setTyping(t));

    socket.on("bot_response", ({ message, assessment, timestamp }) => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: message, assessment, timestamp },
      ]);
    });

    socket.on("error_message", ({ message: errMsg }) => {
      setTyping(false);
      setMessages((prev) => [...prev, { role: "bot", text: errMsg }]);
    });

    socket.on("disconnect", () => setConnected(false));

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = (text) => {
    const msgText = text || input.trim();
    if (!msgText || typing || !socketRef.current) return;

    setInput("");
    setShowQuick(false);

    setMessages((prev) => [
      ...prev,
      { role: "user", text: msgText, timestamp: new Date() },
    ]);

    socketRef.current.emit("send_message", { message: msgText, sessionId });
  };

  return (
    <Box
      sx={{
        height: "calc(100vh - 64px)", // Adjusted for Navbar height
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        overflow: "hidden", // CRITICAL: Prevents body scroll
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
        {/* Header */}
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
              HealthBot
            </Typography>
            <Typography
              fontSize={11}
              color={connected ? "success.main" : "error.main"}
            >
              {connected ? "● Online" : "● Connecting..."}
            </Typography>
          </Box>
          <Box sx={{ ml: "auto" }}>
            <Typography fontSize={12} color="text.secondary">
              {user?.name && `Hello, ${user.name.split(" ")[0]}`}
            </Typography>
          </Box>
        </Box>

        {/* Messages Area */}
        <Box
          sx={{
            flex: 1, // Grows to fill all available middle space
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            pr: 1,
            mb: 2,
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "divider",
              borderRadius: "10px",
            },
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
                    lineHeight={1.6}
                    dangerouslySetInnerHTML={{ __html: msg.text }}
                  />
                </Paper>
              </Box>
            </Box>
          ))}
          {typing && (
            <Typography fontSize={12} color="text.secondary" sx={{ ml: 4 }}>
              Bot is typing...
            </Typography>
          )}
          <div ref={bottomRef} />
        </Box>

        {/* Quick Replies */}
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

        {/* Fixed Input Area */}
        <Box sx={{ pb: 1, bgcolor: "background.default" }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              fullWidth
              size="small"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your symptoms here..."
              sx={{ bgcolor: "background.paper", borderRadius: 1 }}
            />
            <IconButton
              onClick={() => sendMessage()}
              color="primary"
              disabled={!input.trim()}
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
            Preliminary assessment only — not a substitute for medical advice
          </Typography>
        </Box>
      </Container>

      <style>{`@keyframes blink{0%,80%,100%{opacity:.2}40%{opacity:1}}`}</style>
    </Box>
  );
}
