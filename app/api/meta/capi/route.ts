import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const TEST_CODE = process.env.META_CAPI_TEST_EVENT_CODE;

function sha256(value: string) {
  return createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex");
}

export async function POST(req: NextRequest) {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "Meta CAPI not configured" },
      { status: 500 },
    );
  }

  const body = await req.json();
  const {
    event_name,
    event_id,
    event_source_url,
    custom_data,
    email,
    phone,
    external_id,
  } = body;

  if (!event_name || !event_id) {
    return NextResponse.json(
      { error: "event_name and event_id are required" },
      { status: 400 },
    );
  }

  const user_data: Record<string, string | string[]> = {};

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (ip) user_data.client_ip_address = ip;

  const ua = req.headers.get("user-agent");
  if (ua) user_data.client_user_agent = ua;

  const cookieHeader = req.headers.get("cookie") || "";
  const fbp = cookieHeader.match(/_fbp=([^;]+)/)?.[1];
  const fbc = cookieHeader.match(/_fbc=([^;]+)/)?.[1];
  if (fbp) user_data.fbp = fbp;
  if (fbc) user_data.fbc = fbc;

  if (email) user_data.em = [sha256(String(email))];
  if (phone) {
    const digits = String(phone).replace(/\D/g, "");
    if (digits) user_data.ph = [sha256(digits)];
  }
  if (external_id) {
    user_data.external_id = [sha256(String(external_id))];
  }

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name,
        event_time: Math.floor(Date.now() / 1000),
        event_id,
        event_source_url:
          event_source_url || req.headers.get("referer") || undefined,
        action_source: "website",
        user_data,
        ...(custom_data ? { custom_data } : {}),
      },
    ],
  };

  if (TEST_CODE) {
    payload.test_event_code = TEST_CODE;
  }

  const url = `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    console.error("[Meta CAPI error]", json);
    return NextResponse.json({ error: json }, { status: 502 });
  }

  return NextResponse.json({ ok: true, meta: json });
}