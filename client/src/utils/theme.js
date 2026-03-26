export const C = {
  blue: "#1E6FD9",
  blueDark: "#1558B0",
  blueLight: "#EBF3FF",
  green: "#16A34A",
  greenLight: "#DCFCE7",
  yellow: "#D97706",
  yellowLight: "#FEF3C7",
  red: "#DC2626",
  redLight: "#FEE2E2",
  gray50: "#F8FAFC",
  gray100: "#F1F5F9",
  gray200: "#E2E8F0",
  gray300: "#CBD5E1",
  gray400: "#94A3B8",
  gray500: "#64748B",
  gray600: "#475569",
  gray700: "#334155",
  gray800: "#1E293B",
  gray900: "#0F172A",
  white: "#FFFFFF",
};

export const statusColor = (s) =>
  s === "critical" ? C.red : s === "warning" ? C.yellow : C.green;
export const statusBg = (s) =>
  s === "critical" ? C.redLight : s === "warning" ? C.yellowLight : C.greenLight;

export const getStatus = (hr, o2, sbp) => {
  if (hr > 100 || o2 < 93 || sbp > 155) return "critical";
  if (hr > 90 || o2 < 96 || sbp > 140) return "warning";
  return "normal";
};
