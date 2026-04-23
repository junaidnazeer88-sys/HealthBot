import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Chip,
  Container,
  LinearProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

/* ─── Design tokens ───────────────────────────────────────────── */
const C = {
  bg: "#070d1a",
  surface: "#0d1829",
  surfaceHi: "#111f36",
  border: "rgba(255,255,255,0.07)",
  borderHi: "rgba(14,165,233,0.35)",
  accent: "#0ea5e9",
  accentDim: "rgba(14,165,233,0.15)",
  green: "#22d3a5",
  text: "#e2e8f0",
  textMid: "#94a3b8",
  textDim: "#64748b",
  em: "#f87171",
  ur: "#fb923c",
  ro: "#facc15",
  sc: "#34d399",
};

const SEV = {
  EMERGENCY: {
    color: C.em,
    label: "🔴 EMERGENCY",
    bg: "rgba(248,113,113,0.12)",
  },
  URGENT: { color: C.ur, label: "🟠 URGENT", bg: "rgba(251,146,60,0.12)" },
  ROUTINE: { color: C.ro, label: "🟡 ROUTINE", bg: "rgba(250,204,21,0.12)" },
  "SELF-CARE": {
    color: C.sc,
    label: "🟢 SELF-CARE",
    bg: "rgba(52,211,153,0.12)",
  },
};

const QUICK = [
  "I have a headache",
  "High fever",
  "Stomach pain",
  "Chest pain",
  "Cough",
  "Fatigue",
  "Nausea",
  "Dizziness",
];

/* ─── Prediction card ─────────────────────────────────────────── */
function PredictionCard({ conditions }) {
  if (!conditions?.length) return null;
  return (
    <Box
      sx={{
        mt: 1.25,
        p: "12px 14px",
        borderRadius: "10px",
        background: `linear-gradient(135deg, ${C.surfaceHi}, ${C.surface})`,
        border: `0.5px solid ${C.borderHi}`,
      }}
    >
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1.2,
          color: C.accent,
          textTransform: "uppercase",
          mb: 1.25,
          fontFamily: "'Space Mono', monospace",
        }}
      >
        ML Prediction Analysis
      </Typography>

      {conditions.slice(0, 3).map((c, i) => (
        <Box key={i} sx={{ mb: i < 2 ? 1.25 : 0 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}
          >
            <Typography
              sx={{
                fontSize: 12.5,
                fontWeight: i === 0 ? 600 : 400,
                color: i === 0 ? C.text : C.textMid,
              }}
            >
              {i === 0 && (
                <Box
                  component="span"
                  sx={{
                    display: "inline-block",
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: C.accent,
                    mr: 0.75,
                    mb: "1px",
                    verticalAlign: "middle",
                  }}
                />
              )}
              {c.name}
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 600,
                color: i === 0 ? C.accent : C.textDim,
                fontFamily: "'Space Mono', monospace",
              }}
            >
              {c.percentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(c.percentage, 100)}
            sx={{
              height: 3,
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.05)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 2,
                background:
                  i === 0
                    ? `linear-gradient(90deg, ${C.accent}, ${C.green})`
                    : "rgba(255,255,255,0.15)",
              },
            }}
          />
        </Box>
      ))}

      <Typography
        sx={{
          fontSize: 9.5,
          color: C.textDim,
          mt: 1.25,
          fontFamily: "'Space Mono', monospace",
          borderTop: `0.5px solid ${C.border}`,
          pt: 1,
        }}
      >
        Preliminary assessment only — not a medical diagnosis
      </Typography>
    </Box>
  );
}

/* ─── Main Chat ───────────────────────────────────────────────── */
export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showQuick, setShowQuick] = useState(true);
  const bottomRef = useRef(null);

  // Start conversation session on mount
  useEffect(() => {
    const startChat = async () => {
      try {
        const res = await api.post("/api/chat/new");
        setSessionId(res.data.sessionId);
        setMessages([{ role: "bot", text: res.data.greeting }]);
      } catch {
        setMessages([
          {
            role: "bot",
            text: `Hello <strong>${user?.name?.split(" ")[0] || "there"}</strong>! I am your HealthBot. Please describe your symptoms.`,
          },
        ]);
      }
    };
    startChat();
  }, [user]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || typing) return;

    setInput("");
    setShowQuick(false);
    setMessages((p) => [...p, { role: "user", text: msg }]);
    setTyping(true);

    try {
      // 1. Send message to Node.js (Node will handle the AI and Database)
      const res = await api.post("/api/chat/message", {
        message: msg,
        sessionId,
      });

      // 2. Update the UI with the final response from the server
      setMessages((p) => [
        ...p,
        {
          role: "bot",
          text: res.data.botResponse,
          assessment: res.data.assessment,
        },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((p) => [
        ...p,
        {
          role: "bot",
          text: "⚠️ Could not reach the ML service. Please ensure the Python backend is live.",
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const timeNow = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <Box
      sx={{
        height: "calc(100vh - 64px)",
        bgcolor: C.bg,
        overflow: "hidden",
        backgroundImage: `
        radial-gradient(ellipse at 20% 0%,   rgba(14,165,233,0.06) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 100%, rgba(34,211,165,0.04) 0%, transparent 60%)`,
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          py: 2,
        }}
      >
        {/* ── Header ── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
            pb: 1.5,
            borderBottom: `0.5px solid ${C.border}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                background: `linear-gradient(135deg, ${C.accent}, ${C.green})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 16px rgba(14,165,233,0.3)`,
              }}
            >
              <AddIcon sx={{ color: "#fff", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.text,
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                HealthBot
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: C.green,
                    animation: "pulse 2s infinite",
                    "@keyframes pulse": {
                      "0%,100%": { opacity: 1 },
                      "50%": { opacity: 0.35 },
                    },
                  }}
                />
                <Typography
                  sx={{
                    fontSize: 10.5,
                    color: C.green,
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  ML System Active
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              px: 1.5,
              py: 0.6,
              borderRadius: "20px",
              border: `1px solid ${C.accent}`,
              bgcolor: C.surfaceHi,
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                color: "#ffffff",
                fontWeight: 600,
                fontFamily: "'Space Mono', monospace",
              }}
            >
              {user?.name || "Guest"}
            </Typography>
          </Box>
        </Box>

        {/* ── Messages ── */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 1.75,
            pr: 0.5,
            mb: 1.5,
            "&::-webkit-scrollbar": { width: 3 },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: C.border,
              borderRadius: 2,
            },
          }}
        >
          {messages.map((msg, i) => {
            const isUser = msg.role === "user";
            const sev = msg.assessment?.severityLevel;
            const sevMeta = sev ? SEV[sev] : null;

            return (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                  alignItems: "flex-end",
                  gap: 1,
                  animation: "fadeUp .25s ease",
                  "@keyframes fadeUp": {
                    from: { opacity: 0, transform: "translateY(8px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                {!isUser && (
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: "9px",
                      flexShrink: 0,
                      background: `linear-gradient(135deg, ${C.accent}, ${C.green})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 0.25,
                      boxShadow: `0 0 10px rgba(14,165,233,0.2)`,
                    }}
                  >
                    <Typography
                      sx={{ color: "#fff", fontSize: 14, fontWeight: 700 }}
                    >
                      +
                    </Typography>
                  </Box>
                )}

                <Box sx={{ maxWidth: "76%" }}>
                  {sevMeta && (
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        px: 1,
                        py: 0.3,
                        mb: 0.6,
                        borderRadius: "6px",
                        bgcolor: sevMeta.bg,
                        border: `0.5px solid ${sevMeta.color}55`,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: sevMeta.color,
                          fontFamily: "'Space Mono', monospace",
                          letterSpacing: 0.4,
                        }}
                      >
                        {sevMeta.label}
                      </Typography>
                    </Box>
                  )}

                  <Box
                    sx={{
                      px: 1.75,
                      py: 1.25,
                      borderRadius: "14px",
                      ...(isUser
                        ? {
                            background: `linear-gradient(135deg, ${C.accent}, #0284c7)`,
                            color: "#fff",
                            borderBottomRightRadius: "4px",
                            boxShadow: `0 4px 14px rgba(14,165,233,0.25)`,
                          }
                        : {
                            bgcolor: C.surface,
                            border: `0.5px solid ${sevMeta ? sevMeta.color + "44" : C.border}`,
                            color: C.text,
                            borderBottomLeftRadius: "4px",
                          }),
                    }}
                  >
                    <Typography
                      sx={{ fontSize: 13.5, lineHeight: 1.65 }}
                      dangerouslySetInnerHTML={{ __html: msg.text }}
                    />
                    <Typography
                      sx={{
                        fontSize: 9.5,
                        mt: 0.5,
                        opacity: 1,
                        textAlign: isUser ? "right" : "left",
                        fontFamily: "'Space Mono', monospace",
                        color: "#ffffff",
                        fontWeight: 500,
                      }}
                    >
                      {timeNow()}
                    </Typography>
                  </Box>

                  {!isUser &&
                    msg.assessment?.predictedConditions?.length > 0 && (
                      <PredictionCard
                        conditions={msg.assessment.predictedConditions}
                      />
                    )}
                </Box>
              </Box>
            );
          })}

          {typing && (
            <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "9px",
                  background: `linear-gradient(135deg, ${C.accent}, ${C.green})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Typography
                  sx={{ color: "#fff", fontSize: 14, fontWeight: 700 }}
                >
                  +
                </Typography>
              </Box>
              <Box
                sx={{
                  px: 1.75,
                  py: 1.5,
                  borderRadius: "14px",
                  borderBottomLeftRadius: "4px",
                  bgcolor: C.surface,
                  border: `0.5px solid ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                {[0, 1, 2].map((j) => (
                  <Box
                    key={j}
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: C.accent,
                      animation: `bounce 1.2s ${j * 0.2}s infinite`,
                      "@keyframes bounce": {
                        "0%,80%,100%": {
                          transform: "scale(0.6)",
                          opacity: 0.4,
                        },
                        "40%": { transform: "scale(1)", opacity: 1 },
                      },
                    }}
                  />
                ))}
              </Box>
              <Typography
                sx={{
                  fontSize: 11,
                  color: C.textDim,
                  ml: 0.5,
                  fontStyle: "italic",
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                analysing...
              </Typography>
            </Box>
          )}

          <div ref={bottomRef} />
        </Box>

        {/* ── Quick replies ── */}
        {showQuick && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.5 }}>
            {QUICK.map((q) => (
              <Chip
                key={q}
                label={q}
                clickable
                onClick={() => send(q)}
                size="small"
                sx={{
                  bgcolor: C.accentDim,
                  color: C.accent,
                  border: `0.5px solid rgba(14,165,233,0.3)`,
                  fontSize: 11.5,
                  fontWeight: 500,
                  "&:hover": { bgcolor: "rgba(14,165,233,0.25)" },
                  transition: "all .15s",
                }}
              />
            ))}
          </Box>
        )}

        {/* ── Input bar ── */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "flex-end",
            p: 1.25,
            borderRadius: "14px",
            bgcolor: C.surface,
            border: `0.5px solid ${C.border}`,
            "&:focus-within": {
              borderColor: C.borderHi,
              boxShadow: `0 0 0 3px rgba(14,165,233,0.08)`,
            },
            transition: "all .2s",
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={3}
            variant="standard"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Describe your symptoms in detail..."
            InputProps={{ disableUnderline: true }}
            sx={{
              "& .MuiInputBase-root": { padding: 0 },
              "& textarea, & input": {
                color: `${C.text} !important`,
                fontSize: "13.5px",
                lineHeight: 1.6,
                padding: "10px 12px",
                caretColor: C.accent,
                textAlign: "left",
                width: "100%",
              },
              "& textarea::placeholder, & input::placeholder": {
                color: `${C.textMid} !important`,
                opacity: "1 !important",
                textAlign: "left",
                width: "100%",
              },
            }}
          />
          <IconButton
            onClick={() => send()}
            disabled={!input.trim() || typing}
            sx={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              flexShrink: 0,
              background:
                input.trim() && !typing
                  ? `linear-gradient(135deg, ${C.accent}, #0284c7)`
                  : C.surfaceHi,
              color: input.trim() && !typing ? "#fff" : C.textDim,
              transition: "all .2s",
              boxShadow:
                input.trim() && !typing
                  ? `0 4px 12px rgba(14,165,233,0.35)`
                  : "none",
              "&:hover": { transform: "scale(1.05)" },
              "&.Mui-disabled": { bgcolor: C.surfaceHi, color: C.textDim },
            }}
          >
            <SendIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Box>

        {/* ── Disclaimer ── */}
        <Typography
          sx={{
            textAlign: "center",
            fontSize: 9.5,
            color: C.textDim,
            mt: 1,
            fontFamily: "'Space Mono', monospace",
          }}
        >
          THIS IS AN AI PROTOTYPE — Always seek professional medical advice for
          emergencies.
        </Typography>
      </Container>
    </Box>
  );
}
