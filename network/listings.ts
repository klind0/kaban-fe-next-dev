import { IListing } from "@/types/listingTypes";
import {
  createListingAction,
  submitListingAction,
  uploadListingImagesAction,
} from "@/app/actions/listing-actions";

export type BasicListingData = Pick<
  IListing,
  | "title"
  | "status"
  | "property_category"
  | "property_type"
  | "description"
  | "price"
  | "details"
>;

export type MediaListingData = {
  images: File[];
  cover_index: number;
  video_url: string;
};

export type LocationListingData = {
  location: IListing["location"];
};

// ✨ FIXED: Maps empty strings to null instead of deleting keys entirely
function sanitizePayload(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      // 1. If it's a raw empty string, convert it to an explicit null value
      if (v === '') {
        return [k, null];
      }
      
      // 2. If it's a nested object (and not an array), sanitize it recursively
      if (typeof v === 'object' && !Array.isArray(v) && v !== null) {
        return [k, sanitizePayload(v as Record<string, unknown>)];
      }
      
      // 3. Keep original arrays, numbers, booleans, and valid strings intact
      return [k, v];
    })
  );
}

async function createDraft(
  basic: BasicListingData,
  media: MediaListingData,
  location?: LocationListingData,
): Promise<string> {
  const loc = location?.location;
  const hasLocation = loc && (loc.state || loc.city || loc.address);

  // Apply the safe schema mapping conversion
  const input = sanitizePayload({
    ...basic,
    ...(hasLocation ? location : {}),
    cover_index: media.cover_index,
    ...(media.video_url ? { video_url: media.video_url } : {}),
  } as Record<string, unknown>);

  // Force cast numeric fields that may be coming from form components as strings
  if (input.details && typeof input.details === 'object') {
    const details = input.details as Record<string, unknown>;
    if (details.land_area === null || details.land_area === '') {
      details.land_area = null; 
    } else if (typeof details.land_area === 'string') {
      details.land_area = parseFloat(details.land_area) || null;
    }
  }

  const result = await createListingAction(input);
  return result.id;
}

async function uploadImages(listingId: string, files: File[]): Promise<void> {
  if (!files || files.length === 0) {
    console.log("🟡 [NETWORK] No images array provided for upload execution.");
    return;
  } 

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });

  // 🕵️‍♂️ BOUNDARY PAYLOAD MIRROR
  console.log("==========================================");
  console.log(`📦 [NETWORK] COMPILING MULTIPART STREAM FOR ID: ${listingId}`);
  for (let [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`👉 Field Key: "${key}" | [File Object] -> Name: "${value.name}" | Size: ${value.size} bytes`);
    } else {
      console.log(`👉 Field Key: "${key}" | Value: "${value}"`);
    }
  }
  console.log("==========================================");

  return uploadListingImagesAction(listingId, formData);
}

async function submitListing(listingId: string): Promise<unknown> {
  return submitListingAction(listingId);
}

export async function createListing(
  basic: BasicListingData,
  media: MediaListingData,
  location: LocationListingData | null,
  submit: boolean,
): Promise<unknown> {
  // Step 1: Hit NestJS GraphQL backend to save textual data properties
  const listingId = await createDraft(basic, media, location ?? undefined);
  
  // Step 2: Hit NestJS REST endpoint to process multi-part stream array files
  await uploadImages(listingId, media.images);
  
  if (submit) {
    return submitListing(listingId);
  }
  return { id: listingId };
}