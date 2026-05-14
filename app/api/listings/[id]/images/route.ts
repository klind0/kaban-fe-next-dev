import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL || "";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authHeader = request.headers.get("Authorization");

  // Parse the incoming multipart body on the Next.js side
  const incoming = await request.formData();

  // Re-create a clean FormData so fetch sets a fresh boundary
  const fd = new FormData();
  const files = incoming.getAll("images");
  for (const file of files) {
    fd.append("images", file);
  }

  const headers: Record<string, string> = {};
  if (authHeader) headers["Authorization"] = authHeader;
  // Do NOT set Content-Type — fetch will set multipart/form-data with the correct boundary

  try {
    const response = await fetch(`${BACKEND_URL}/api/listings/${id}/images`, {
      method: "POST",
      headers,
      body: fd,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: "Something went wrong, try again!" },
      { status: 500 },
    );
  }
}
