/**
 * Converts any raw string into a cleanly formatted Title Case string.
 * Example: "ikot ntuen nsit, uyo, akwa ibom" -> "Ikot Ntuen Nsit, Uyo, Akwa Ibom"
 */
export function toTitleCase(str: string | undefined | null): string {
  if (!str) return "";
  
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}