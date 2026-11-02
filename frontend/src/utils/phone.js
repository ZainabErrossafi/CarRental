// Keep digits and an optional leading international dialing prefix.
export const sanitizePhone = (value) => {
  const cleaned = value.replace(/[^0-9+]/g, "");
  return (cleaned.startsWith("+") ? "+" : "") + cleaned.replace(/\+/g, "");
};
