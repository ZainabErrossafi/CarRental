export function initials(email) {
  return email.charAt(0).toUpperCase();
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
