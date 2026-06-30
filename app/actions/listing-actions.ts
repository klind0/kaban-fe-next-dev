"use server";

import {
  CREATE_LISTING_MUTATION,
  SUBMIT_LISTING_MUTATION,
} from "@/network/gql/listings.ql";
import { serverGqlRequest } from "@/network/server-graphql-client";
import { QUERY_KEY } from "@/enum/queryKeys";
import { cookies } from "next/headers";
// 🛠️ FIX: Import the redirect error checker from Next.js
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function createListingAction(
  input: Record<string, any>,
): Promise<{ success: boolean; id?: string; error?: string }> { 
  try {
    const sanitizedInput = { ...input };

    if (sanitizedInput.location) {
      const { coordinates } = sanitizedInput.location;
      if (coordinates && typeof coordinates === "object" && !Array.isArray(coordinates)) {
        const lng = Number(coordinates.lng);
        const lat = Number(coordinates.lat);
        if (!isNaN(lng) && !isNaN(lat)) {
          sanitizedInput.location.coordinates = [lng, lat];
        }
      }
    }

    console.log("==========================================");
    console.log("📡 [SERVER ACTION] SENDING TO GRAPHQL (SANITIZED):");
    console.log(JSON.stringify(sanitizedInput, null, 2));
    console.log("==========================================");

    const data = await serverGqlRequest<{ createListing: { id: string } }>(
      CREATE_LISTING_MUTATION,
      { input: sanitizedInput, submit: false }, 
    );
    
    return { success: true, id: data.createListing.id }; 
    
  } catch (error: any) {
    // 🛠️ THE CRITICAL FIX: If it's a redirect, rethrow it so Next.js can change pages!
    if (isRedirectError(error)) {
      throw error;
    }

    console.error("❌ [SERVER ACTION] GRAPHQL MUTATION CRASHED!");
    
    let friendlyMessage = error?.message || "Failed to create listing due to a server error.";
    
    // Adjusted check to accommodate clean GraphQL error arrays from fetch
    if (error?.errors && Array.isArray(error.errors)) {
      friendlyMessage = error.errors[0]?.message || friendlyMessage;
    } else if (error?.response?.errors) {
      console.error("📋 NestJS Validation Error Details:", JSON.stringify(error.response.errors, null, 2));
      friendlyMessage = error.response.errors[0]?.message || friendlyMessage;
    } else {
      console.error("💥 Error Context:", error);
    }
    console.log("==========================================");
    
    return { success: false, error: friendlyMessage };
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
  
  if (!baseUrl) {
    console.error("❌ [SERVER ACTION] CRITICAL ERROR: process.env.API_URL is undefined!");
    throw new Error("Server configuration error: API base URL is missing.");
  }

  const cleanBaseUrl = baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
  const targetUrl = `${cleanBaseUrl}/listings/${listingId}/images`;
  
  console.log("==========================================");
  console.log("🖥️ [SERVER ACTION] EXECUTING HANDSHAKE...");
  console.log(`📡 Forwarding Target: POST ${targetUrl}`);

  const files = formData.getAll("images");
  console.log(`📥 Received Stream Contains: ${files.length} files under key "images"`);

  if (!files || files.length === 0) {
    console.warn("⚠️ [SERVER ACTION]: Aborting. Zero files detected in the target payload stream.");
    return;
  }

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
      body: formData, 
    });

    console.log("==========================================");
    console.log(`🏁 [BACKEND RESPONSE HANDSHAKE STATUS: ${res.status} ${res.statusText}]`);
    console.log("📋 Content-Type Header Received:", res.headers.get("content-type"));

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
      const backendMessage = isJson ? (parsedJson?.message || parsedJson?.error) : null;
      throw new Error(backendMessage ?? `Backend Rejected Request with status ${res.status}`);
    }

  } catch (error: any) {
    console.error("💥 [SERVER ACTION EXCEPTION] RUNTIME CRASH:");
    console.error(`   Message: ${error?.message}`);
    console.error(`   Stack: ${error?.stack}`);
    console.log("==========================================");
    throw new Error(error?.message || "Image server handshake failed.");
  }
}