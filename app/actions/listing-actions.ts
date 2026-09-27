"use server";

import {
  CREATE_LISTING_MUTATION,
  SUBMIT_LISTING_MUTATION,
  DELETE_LISTING_MUTATION,
  SET_FEATURED_LISTINGS_MUTATION,
} from "@/network/gql/listings.ql";
import { serverGqlRequest } from "@/network/server-graphql-client";
import { QUERY_KEY } from "@/enum/queryKeys";
import { cookies } from "next/headers";
import { isRedirectError } from "next/dist/client/components/redirect-error";

function logAction(scope: string, phase: string, extra?: Record<string, unknown>) {
  const payload = {
    scope,
    phase,
    ts: new Date().toISOString(),
    ...extra,
  };
  if (phase === "fail") {
    console.error(`[LISTING_ACTION] ${scope} ${phase}`, payload);
  } else {
    console.log(`[LISTING_ACTION] ${scope} ${phase}`, payload);
  }
}

export async function createListingAction(
  input: Record<string, any>,
): Promise<{ success: boolean; id?: string; error?: string }> {
  const started = Date.now();
  logAction("createListingAction", "start", {
    hasTitle: !!input?.title,
    hasLocation: !!input?.location,
    hasDetails: !!input?.details,
    imageCount: Array.isArray(input?.images) ? input.images.length : 0,
  });

  try {
    const sanitizedInput = { ...input };

    if (sanitizedInput.location) {
      const { coordinates } = sanitizedInput.location;
      if (
        coordinates &&
        typeof coordinates === "object" &&
        !Array.isArray(coordinates)
      ) {
        const lng = Number(coordinates.lng);
        const lat = Number(coordinates.lat);
        if (!isNaN(lng) && !isNaN(lat)) {
          // Backend expects [lng, lat] or [lat, lng]? Keep your existing convention.
          sanitizedInput.location.coordinates = [lng, lat];
        }
      }
    }

    const data = await serverGqlRequest<{ createListing: { id: string } }>(
      CREATE_LISTING_MUTATION,
      { input: sanitizedInput, submit: false },
    );

    logAction("createListingAction", "ok", {
      id: data?.createListing?.id,
      ms: Date.now() - started,
    });

    return { success: true, id: data.createListing.id };
  } catch (error: any) {
    if (isRedirectError(error)) {
      throw error;
    }

    let friendlyMessage =
      error?.message || "Failed to create listing due to a server error.";

    if (error?.errors && Array.isArray(error.errors)) {
      friendlyMessage = error.errors[0]?.message || friendlyMessage;
    } else if (error?.response?.errors) {
      console.error(
        "📋 NestJS Validation Error Details:",
        JSON.stringify(error.response.errors, null, 2),
      );
      friendlyMessage =
        error.response.errors[0]?.message || friendlyMessage;
    }

    logAction("createListingAction", "fail", {
      ms: Date.now() - started,
      message: friendlyMessage,
      name: error?.name,
      statusCode: error?.statusCode ?? error?.response?.status,
    });

    return { success: false, error: friendlyMessage };
  }
}

export async function submitListingAction(id: string): Promise<unknown> {
  const started = Date.now();
  logAction("submitListingAction", "start", { id });

  try {
    const data = await serverGqlRequest<{ submitListing: unknown }>(
      SUBMIT_LISTING_MUTATION,
      { id },
    );

    logAction("submitListingAction", "ok", {
      id,
      ms: Date.now() - started,
    });

    return data.submitListing;
  } catch (error: any) {
    logAction("submitListingAction", "fail", {
      id,
      ms: Date.now() - started,
      message: error?.message,
      name: error?.name,
    });
    throw error;
  }
}

export async function uploadListingImagesAction(
  listingId: string,
  formData: FormData,
): Promise<void> {
  const started = Date.now();
  const baseUrl = process.env.API_URL;

  if (!baseUrl) {
    logAction("uploadListingImagesAction", "fail", {
      listingId,
      message: "API_URL is undefined",
    });
    throw new Error("Server configuration error: API base URL is missing.");
  }

  const cleanBaseUrl = baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
  const targetUrl = `${cleanBaseUrl}/listings/${listingId}/images`;

  const files = formData.getAll("images");
  const fileMeta = files.map((file: any) => ({
    name: file?.name || "unknown",
    size: file?.size ?? 0,
    type: file?.type || "unknown",
  }));
  const totalBytes = fileMeta.reduce((sum, f) => sum + (f.size || 0), 0);

  logAction("uploadListingImagesAction", "start", {
    listingId,
    targetUrl,
    fileCount: files.length,
    totalBytes,
    files: fileMeta,
  });

  if (!files || files.length === 0) {
    logAction("uploadListingImagesAction", "skip", {
      listingId,
      reason: "zero files",
      ms: Date.now() - started,
    });
    return;
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(QUERY_KEY.ACCESS_TOKEN)?.value;

  logAction("uploadListingImagesAction", "auth", {
    listingId,
    hasToken: !!accessToken,
  });

  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      body: formData,
    });

    const rawResponseText = await res.text();
    let parsedJson: any = null;
    let isJson = false;

    try {
      parsedJson = JSON.parse(rawResponseText);
      isJson = true;
    } catch {
      // non-JSON body
    }

    logAction("uploadListingImagesAction", "response", {
      listingId,
      status: res.status,
      statusText: res.statusText,
      contentType: res.headers.get("content-type"),
      bodyPreview: rawResponseText?.slice(0, 300) || "[empty]",
      ms: Date.now() - started,
    });

    if (!res.ok) {
      const backendMessage = isJson
        ? parsedJson?.message || parsedJson?.error
        : null;
      throw new Error(
        backendMessage ?? `Backend Rejected Request with status ${res.status}`,
      );
    }

    logAction("uploadListingImagesAction", "ok", {
      listingId,
      ms: Date.now() - started,
    });
  } catch (error: any) {
    logAction("uploadListingImagesAction", "fail", {
      listingId,
      targetUrl,
      ms: Date.now() - started,
      message: error?.message,
      name: error?.name,
      cause: error?.cause ? String(error.cause) : undefined,
    });
    throw new Error(error?.message || "Image server handshake failed.");
  }
}

export async function deleteListingAction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  const started = Date.now();
  logAction("deleteListingAction", "start", { id });

  try {
    const data = await serverGqlRequest<{ deleteListing: any }>(
      DELETE_LISTING_MUTATION,
      { id },
    );

    if (data?.deleteListing?.success === false) {
      logAction("deleteListingAction", "fail", {
        id,
        ms: Date.now() - started,
        message: data.deleteListing.message,
      });
      return {
        success: false,
        error: data.deleteListing.message || "Deletion rejected by server.",
      };
    }

    logAction("deleteListingAction", "ok", {
      id,
      ms: Date.now() - started,
    });
    return { success: true };
  } catch (error: any) {
    const friendlyMessage =
      error?.errors?.[0]?.message ||
      error?.message ||
      "Failed to delete listing.";
    logAction("deleteListingAction", "fail", {
      id,
      ms: Date.now() - started,
      message: friendlyMessage,
    });
    return { success: false, error: friendlyMessage };
  }
}

export async function setFeaturedListingsAction(
  listingIds: string[],
): Promise<{ success: boolean; error?: string }> {
  try {
    const ids = listingIds.filter(Boolean);
    if (ids.length === 0) {
      return { success: false, error: "At least one listing ID is required" };
    }

    await serverGqlRequest(SET_FEATURED_LISTINGS_MUTATION, {
      listingIds: ids,
    });

    return { success: true };
  } catch (error: any) {
    console.error("❌ Failed to set featured listings:", error);
    const message =
      error?.errors?.[0]?.message ||
      error?.message ||
      "Failed to update featured listings.";
    return { success: false, error: message };
  }
}

export async function upgradeListingToFeaturedAction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  return setFeaturedListingsAction([id]);
}