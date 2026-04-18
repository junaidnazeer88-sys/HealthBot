// client/src/pages/Chat.js  — updated to use Socket.IO
// Replace your existing Chat.js with this version

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  Chip,
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

  // ── Connect Socket.IO on mount ────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("healthbot_token");

    const socket = io(
      process.env.REACT_APP_SOCKET_URL || "http://localhost:3001",
      {
        auth: { token }, // JWT sent with every connection
        transports: ["websocket"], // prefer WebSocket over polling
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      },
    );

    socketRef.current = socket;

    // Connected — start a new conversation
    socket.on("connect", () => {
      setConnected(true);
      socket.emit("start_conversation");
    });

    // Conversation started — show greeting
    socket.on("conversation_started", ({ sessionId: sid, greeting }) => {
      setSessionId(sid);
      setMessages([{ role: "bot", text: greeting, timestamp: new Date() }]);
    });

    // Bot is typing
    socket.on("bot_typing", ({ typing: t }) => setTyping(t));

    // Bot response received
    socket.on("bot_response", ({ message, assessment, timestamp }) => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: message,
          assessment,
          timestamp,
        },
      ]);
    });

    // Error
    socket.on("error_message", ({ message: errMsg }) => {
      setTyping(false);
      setMessages((prev) => [...prev, { role: "bot", text: errMsg }]);
    });

    // Disconnected
    socket.on("disconnect", () => setConnected(false));

    // Clean up on unmount
    return () => socket.disconnect();
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = (text) => {
    const msgText = text || input.trim();
    if (!msgText || typing || !socketRef.current) return;

    setInput("");
    setShowQuick(false);

    // Optimistically add user message to UI
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: msgText,
        timestamp: new Date(),
      },
    ]);

    // Emit via Socket.IO — no HTTP request needed
    socketRef.current.emit("send_message", { message: msgText, sessionId });
  };

  return (
    <Box
      sx={{
        height: "calc(100vh - 60px)",
        display: "flex",
        flexDirection: "column",
        maxWidth: 680,
        mx: "auto",
        p: 2,
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
            fontSize: 16,
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
            {connected ? "● Online" : "● Reconnecting..."}
          </Typography>
        </Box>
        <Box sx={{ ml: "auto" }}>
          <Typography fontSize={12} color="text.secondary">
            {user?.name?.split(" ")[0] && `Hello, ${user.name.split(" ")[0]}`}
          </Typography>
        </Box>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          pb: 1,
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
            <Box sx={{ maxWidth: "78%" }}>
              {msg.assessment?.severityLevel && (
                <Chip
                  label={msg.assessment.severityLevel}
                  size="small"
                  sx={{
                    mb: 0.5,
                    fontSize: 10,
                    fontFamily: "Space Mono",
                    bgcolor: SEV_COLORS[msg.assessment.severityLevel] + "22",
                    color: SEV_COLORS[msg.assessment.severityLevel],
                    border: `1px solid ${SEV_COLORS[msg.assessment.severityLevel]}44`,
                  }}
                />
              )}
              <Paper
                elevation={0}
                sx={{
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  ...(msg.role === "user"
                    ? {
                        bgcolor: "primary.main",
                        color: "#fff",
                        borderBottomRightRadius: 4,
                      }
                    : {
                        bgcolor: "background.paper",
                        border: "0.5px solid",
                        borderColor: "divider",
                        borderBottomLeftRadius: 4,
                      }),
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

        {/* Live typing indicator */}
        {typing && (
          <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
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
              }}
            >
              +
            </Box>
            <Paper
              elevation={0}
              sx={{
                px: 2,
                py: 1.5,
                border: "0.5px solid",
                borderColor: "divider",
                borderRadius: 2,
                borderBottomLeftRadius: 4,
              }}
            >
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {[0, 1, 2].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "text.disabled",
                      animation: `blink 1.2s ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Box>
        )}
        <div ref={bottomRef} />
      </Box>

      {/* Quick replies */}
      {showQuick && messages.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.5 }}>
          {QUICK_REPLIES.map((q) => (
            <Chip
              key={q}
              label={q}
              size="small"
              variant="outlined"
              clickable
              onClick={() => sendMessage(q)}
              sx={{
                fontSize: 12,
                cursor: "pointer",
                borderColor: "primary.main",
                color: "primary.main",
                "&:hover": { bgcolor: "primary.main" + "18" },
              }}
            />
          ))}
        </Box>
      )}

      {/* Input */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
        <TextField
          fullWidth
          multiline
          maxRows={3}
          size="small"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Describe your symptoms..."
          disabled={!connected}
        />
        <IconButton
          onClick={() => sendMessage()}
          color="primary"
          disabled={typing || !input.trim() || !connected}
          sx={{
            bgcolor: "primary.main",
            color: "#fff",
            borderRadius: 2,
            "&:hover": { bgcolor: "primary.dark" },
            "&:disabled": { bgcolor: "action.disabled" },
          }}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>

      <Typography fontSize={11} color="text.disabled" textAlign="center" mt={1}>
        Preliminary assessment only — not a substitute for medical advice
      </Typography>

      <style>{`@keyframes blink{0%,80%,100%{opacity:.2}40%{opacity:1}}`}</style>
    </Box>
  );
}
