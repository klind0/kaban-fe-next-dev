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

function cleanGraphQLInput(obj: any): any {
  if (obj === null || obj === undefined) return undefined;
  
  if (Array.isArray(obj)) {
    return obj.map(cleanGraphQLInput);
  }

  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === '') continue;
      
      const processed = cleanGraphQLInput(value);
      if (processed !== undefined && processed !== null) {
        if (typeof processed === 'object' && !Array.isArray(processed) && Object.keys(processed).length === 0) {
          continue;
        }
        cleaned[key] = processed;
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }

  return obj;
}

async function createDraft(
  basic: BasicListingData,
  media: MediaListingData,
  location?: LocationListingData,
): Promise<string> {
  const loc = location?.location;
  const hasLocation = loc && (loc.state || loc.city || loc.address);

  // Deeply copy clean fields, excluding media parameters like cover_index from the root text input
  const rawPayload: Record<string, any> = JSON.parse(JSON.stringify({
    ...basic,
  }));

  // Map out coordinates to safe key/value float items if they exist
  if (hasLocation && location?.location) {
    const sourceCoords = location.location.coordinates;
    
    rawPayload.location = {
      state: location.location.state,
      city: location.location.city,
      address: location.location.address,
      landmark: location.location.landmark || undefined,
      coordinates:
        Array.isArray(sourceCoords) && sourceCoords.length === 2
          ? [Number(sourceCoords[1]), Number(sourceCoords[0])] // [lng, lat]
          : undefined,
    };
  }

  if (media.video_url && media.video_url !== '') {
    rawPayload.video = media.video_url;
  }

  if (rawPayload.price?.amount) {
    rawPayload.price.amount = Number(rawPayload.price.amount);
  }

  if (rawPayload.details) {
    const d = rawPayload.details;
    if (d.bedroom != null) d.bedroom = Number(d.bedroom);
    if (d.bathroom) d.bathroom = Number(d.bathroom);
    if (d.toilet) d.toilet = Number(d.toilet);
    if (d.living_room) d.living_room = Number(d.living_room);
    if (d.parking_space) d.parking_space = Number(d.parking_space);
    
    if (d.land_area === "" || d.land_area == null) delete d.land_area;
    else d.land_area = String(d.land_area);
  }

  // ✨ FIX 2: Explicitly clear cover_index out of this payload text schema entirely
  delete rawPayload.cover_index;

  const input = cleanGraphQLInput(rawPayload);

  const result = await createListingAction(input);

  if (!result.success || !result.id) {
    throw new Error(result.error || "Failed to create listing ID from server action.");
  }

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
  const listingId = await createDraft(basic, media, location ?? undefined);
  
  await uploadImages(listingId, media.images);
  
  if (submit) {
    return submitListing(listingId);
  }
  return { id: listingId };
}