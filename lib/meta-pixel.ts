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

/**
 * Fires the same event on Meta Pixel (browser) and Conversions API (server)
 * with a shared event_id so Meta can deduplicate.
 */
export async function trackMetaEventWithCapi(options: {
  eventName: string;
  params?: Record<string, unknown>;
  email?: string;
  phone?: string;
  external_id?: string;
}) {
  const eventId = newMetaEventId();

  trackMetaEvent(options.eventName, options.params, eventId);

  try {
    const response = await fetch("/api/meta/capi", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: options.eventName,
        event_id: eventId,
        event_source_url:
          typeof window !== "undefined" ? window.location.href : undefined,
        custom_data: options.params,
        email: options.email,
        phone: options.phone,
        external_id: options.external_id,
      }),
    });
    if (!response.ok) {
      console.error(`[Meta CAPI client] Request failed with ${response.status}`);
    }
  } catch (err) {
    // Pixel still fired; don't break the page if CAPI fails
    console.error("[Meta CAPI client]", err);
  }

  return eventId;
}