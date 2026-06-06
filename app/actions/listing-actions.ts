"use server";

import {
  CREATE_LISTING_MUTATION,
  SUBMIT_LISTING_MUTATION,
} from "@/network/gql/listings.ql";
import { serverGqlRequest } from "@/network/server-graphql-client";
import { QUERY_KEY } from "@/enum/queryKeys";
import { cookies } from "next/headers";

export async function createListingAction(
  input: Record<string, any>, // Using any here to make deep mutations cleaner
): Promise<{ id: string }> {
  try {
    // 🛠️ FIX: Deep copy the input to prevent mutating state, and reformat coordinates
    const sanitizedInput = { ...input };

    if (sanitizedInput.location) {
      const { coordinates } = sanitizedInput.location;
      
      // If coordinates are passed as an object { lat: ..., lng: ... }, reshape into [lng, lat]
      if (coordinates && typeof coordinates === "object" && !Array.isArray(coordinates)) {
        const lng = Number(coordinates.lng);
        const lat = Number(coordinates.lat);

        if (!isNaN(lng) && !isNaN(lat)) {
          sanitizedInput.location.coordinates = [lng, lat]; // [longitude, latitude] matching Swagger DTO
        }
      }
    }

    console.log("==========================================");
    console.log("📡 [SERVER ACTION] SENDING TO GRAPHQL (SANITIZED):");
    console.log(JSON.stringify(sanitizedInput, null, 2));
    console.log("==========================================");

    const data = await serverGqlRequest<{ createListing: { id: string } }>(
      CREATE_LISTING_MUTATION,
      // ✨ Pass the sanitized version down
      { input: sanitizedInput, submit: false }, 
    );
    return data.createListing;
  } catch (error: any) {
    console.error("❌ [SERVER ACTION] GRAPHQL MUTATION CRASHED!");
    
    // Log out absolute inner details if the network client attached them
    if (error?.response?.errors) {
      console.error("📋 NestJS Validation Error Details:", JSON.stringify(error.response.errors, null, 2));
    } else {
      console.error("💥 Error Context:", error);
    }
    console.log("==========================================");
    throw error;
  }
}

export async function submitListingAction(id: string): Promise<unknown> {
  const data = await serverGqlRequest<{ submitListing: unknown }>(
    SUBMIT_LISTING_MUTATION,
    { id },
  );
  return data.submitListing;
}

export async function uploadListingImagesAction(
  listingId: string,
  formData: FormData,
): Promise<void> {
  const baseUrl = process.env.API_URL;
  
  // Safeguard against a completely missing or misspelled environment variable
  if (!baseUrl) {
    console.error("❌ [SERVER ACTION] CRITICAL ERROR: process.env.API_URL is undefined!");
    throw new Error("Server configuration error: API base URL is missing.");
  }

  const targetUrl = `${baseUrl}/api/listings/${listingId}/images`;
  
  console.log("==========================================");
  console.log("🖥️ [SERVER ACTION] EXECUTING HANDSHAKE...");
  console.log(`📡 Forwarding Target: POST ${targetUrl}`);

  // Safely extract files from the stream (avoids brittle .has() bugs with custom browser engines)
  const files = formData.getAll("images");
  console.log(`📥 Received Stream Contains: ${files.length} files under key "images"`);

  if (!files || files.length === 0) {
    console.warn("⚠️ [SERVER ACTION]: Aborting. Zero files detected in the target payload stream.");
    return;
  }

  // Deep inspection loop to track payload integrity
  files.forEach((file: any) => {
    console.log(`- File Name: ${file.name || "Unknown Name"}, Size: ${file.size || 0} bytes`);
  });

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(QUERY_KEY.ACCESS_TOKEN)?.value;
  console.log(`🔑 Auth Token Attached: ${accessToken ? "YES (Bearer token found)" : "NO"}`);
  console.log("==========================================");

  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      body: formData, // Next.js streams this binary stream to the backend perfectly
    });

    console.log("==========================================");
    console.log(`🏁 [BACKEND RESPONSE HANDSHAKE STATUS: ${res.status} ${res.statusText}]`);
    console.log("📋 Content-Type Header Received:", res.headers.get("content-type"));

    // Read the body payload as text into memory FIRST. 
    // This allows us to log raw HTML crashes (502 errors) without breaking the stream.
    const rawResponseText = await res.text();
    console.log("📥 RAW BACKEND OUTPUT PAYLOAD:");
    
    let parsedJson: any = null;
    let isJson = false;

    try {
      parsedJson = JSON.parse(rawResponseText);
      isJson = true;
      console.log(JSON.stringify(parsedJson, null, 2));
    } catch {
      console.log(rawResponseText || "[Empty Response Body]");
    }
    console.log("==========================================");

    if (!res.ok) {
      // Re-use the already consumed stream data from memory to pull the precise error message
      const backendMessage = isJson ? (parsedJson?.message || parsedJson?.error) : null;
      throw new Error(backendMessage ?? `Backend Rejected Request with status ${res.status}`);
    }

  } catch (error: any) {
    console.error("💥 [SERVER ACTION EXCEPTION] RUNTIME CRASH:");
    console.error(`   Message: ${error?.message}`);
    console.error(`   Stack: ${error?.stack}`);
    console.log("==========================================");
    throw error;
  }
}