import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const BACKEND_URL = process.env.API_URL || "";

async function handleRequest(
  request: NextRequest,
  params: Promise<{ path: string[] }>,
  method: string,
) {
  const { path: pathArray } = await params;
  const path = pathArray.join("/");
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${BACKEND_URL}/${path}${searchParams ? `?${searchParams}` : ""}`;

  const authHeader = request.headers.get("Authorization");
  const contentType = request.headers.get("Content-Type");

  const headers: HeadersInit = {};

  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  // Only set Content-Type explicitly for JSON — for multipart the browser-set
  // boundary must be preserved, so forward the original header as-is.
  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  let data: Buffer | string | ReadableStream | null | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const isMultipart = contentType?.startsWith("multipart/form-data");
    if (isMultipart) {
      // Stream directly — buffering multipart data can corrupt the boundary
      data = request.body;
    } else {
      const body = await request.text();
      if (body) data = body;
    }
  }

  try {
    const response = await axios({
      url,
      method,
      headers,
      data,
      // Required for streaming body in axios
      ...(data instanceof ReadableStream ? { responseType: "stream" } : {}),
    });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      });
    }
    return NextResponse.json(
      { message: "Something went wrong, try again!" },
      { status: 500 },
    );
  }
}
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleRequest(request, params, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleRequest(request, params, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleRequest(request, params, "PUT");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleRequest(request, params, "DELETE");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleRequest(request, params, "PATCH");
}
