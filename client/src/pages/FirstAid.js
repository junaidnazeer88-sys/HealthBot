import React, { useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const PROCEDURES = [
  {
    type: "Severe Bleeding",
    icon: "🩸",
    severity: "EMERGENCY",
    steps: [
      "Call 102 if bleeding is severe",
      "Apply firm direct pressure with clean cloth",
      "Keep pressure for 10–15 minutes",
      "Do NOT remove cloth — add more on top",
      "Elevate injured area above the heart",
    ],
    avoid: "Do not remove embedded objects. Do not probe the wound.",
    call: "If bleeding does not slow after 15 minutes",
  },
  {
    type: "CPR",
    icon: "🫀",
    severity: "EMERGENCY",
    steps: [
      "Ensure scene is safe — call 102",
      "Place heel of hand on centre of chest",
      "Push hard and fast — 100–120 compressions per minute",
      "Tilt head, lift chin, give 2 rescue breaths",
      "Repeat 30:2 until help arrives",
    ],
    avoid: "Do not stop compressions unless the person starts breathing.",
    call: "Immediately — CPR keeps blood flowing, it does not restart the heart",
  },
  {
    type: "Burns",
    icon: "🔥",
    severity: "URGENT",
    steps: [
      "Remove from heat source immediately",
      "Cool under running water for 10–20 mins",
      "Do NOT use ice, butter, or toothpaste",
      "Cover loosely with sterile bandage",
    ],
    avoid: "Never use ice, butter, or toothpaste on burns.",
    call: "If burn is larger than palm, or on face, hands, or genitals",
  },
  {
    type: "Choking (Adult)",
    icon: "🤿",
    severity: "URGENT",
    steps: [
      'Ask "Are you choking?" — if cannot speak, act immediately',
      "Give 5 firm back blows between shoulder blades",
      "Give 5 abdominal thrusts (Heimlich manoeuvre)",
      "Repeat until dislodged",
    ],
    avoid: "Do not do blind finger sweeps in the mouth.",
    call: "Immediately if person becomes unconscious",
  },
  {
    type: "Fracture / Broken Bone",
    icon: "🦴",
    severity: "ROUTINE",
    steps: [
      "Do not try to straighten the bone",
      "Immobilise with splint or sling",
      "Apply ice pack wrapped in cloth — 20 mins on, 20 off",
      "Keep elevated if possible",
      "Get to hospital",
    ],
    avoid: "Do not move the person if spine injury is suspected.",
    call: "If open fracture, loss of sensation, or suspected spine injury",
  },
];

const SEV_COLOR = {
  EMERGENCY: "#ef4444",
  URGENT: "#f59e0b",
  ROUTINE: "#22c55e",
};

export default function FirstAid() {
  return (
    <Box sx={{ maxWidth: 720, mx: "auto", p: 3 }}>
      <Typography
        variant="h5"
        fontFamily="Space Mono, monospace"
        fontWeight={700}
        mb={1}
      >
        First aid guide
      </Typography>
      <Typography color="text.secondary" fontSize={13} mb={3}>
        WHO-verified procedures. Click any emergency to expand.
      </Typography>

      {/* Emergency number banner */}
      <Box
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          bgcolor: "#ef444415",
          border: "0.5px solid #ef444430",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Typography fontSize={20}>🚨</Typography>
        <Box>
          <Typography fontWeight={600} color="#ef4444" fontSize={14}>
            Emergency?
          </Typography>
          <Typography fontSize={13} color="text.secondary">
            Call <strong>102</strong> (Ambulance) or <strong>112</strong>{" "}
            (Emergency) immediately
          </Typography>
        </Box>
      </Box>

      {PROCEDURES.map((p) => (
        <Accordion
          key={p.type}
          elevation={0}
          sx={{
            border: "0.5px solid",
            borderColor: "divider",
            borderRadius: "12px !important",
            mb: 1,
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                width: "100%",
              }}
            >
              <Typography fontSize={22}>{p.icon}</Typography>
              <Typography fontWeight={500} fontSize={14} flex={1}>
                {p.type}
              </Typography>
              <Chip
                label={p.severity}
                size="small"
                sx={{
                  fontSize: 10,
                  fontFamily: "Space Mono",
                  bgcolor: SEV_COLOR[p.severity] + "18",
                  color: SEV_COLOR[p.severity],
                  border: `1px solid ${SEV_COLOR[p.severity]}33`,
                }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              fontSize={12}
              fontWeight={600}
              color="text.secondary"
              textTransform="uppercase"
              letterSpacing={0.5}
              mb={1}
            >
              Steps
            </Typography>
            <Box component="ol" sx={{ pl: 2, mb: 2 }}>
              {p.steps.map((s, i) => (
                <Typography
                  component="li"
                  key={i}
                  fontSize={13}
                  color="text.secondary"
                  lineHeight={1.7}
                >
                  {s}
                </Typography>
              ))}
            </Box>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: "#f59e0b0f",
                border: "0.5px solid #f59e0b25",
                mb: 1.5,
              }}
            >
              <Typography fontSize={12} color="warning.main">
                <strong>Avoid:</strong> {p.avoid}
              </Typography>
            </Box>
            <Typography fontSize={12} color="text.secondary">
              <strong>Call ambulance if:</strong> {p.call}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
