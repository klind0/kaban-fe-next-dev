export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

export function trackMetaEvent(
  eventName: string,
  params?: Record<string, unknown>,
  eventId?: string,
) {
  if (typeof window === "undefined") return;
  const fbq = (window as any).fbq;
  if (typeof fbq !== "function") return;

  if (eventId) {
    fbq("track", eventName, params || {}, { eventID: eventId });
  } else {
    fbq("track", eventName, params || {});
  }
}

export function newMetaEventId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}