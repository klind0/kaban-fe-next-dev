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

// Clean utility to strip empty properties completely out of the key space
function cleanGraphQLInput(obj: any): any {
  if (obj === null || obj === undefined) return undefined;
  
  if (Array.isArray(obj)) {
    return obj.map(cleanGraphQLInput);
  }

  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip empty string properties entirely so they default to undefined
      if (value === '') continue;
      
      const processed = cleanGraphQLInput(value);
      // Skip objects that ended up completely empty after internal cleaning
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

  // Deeply copy basic inputs to safeguard against mutating source component states
  const rawPayload: Record<string, any> = JSON.parse(JSON.stringify({
    ...basic,
    ...(hasLocation ? { location: location.location } : {}),
    cover_index: media.cover_index,
  }));

  if (media.video_url && media.video_url !== '') {
    rawPayload.video_url = media.video_url;
  }

  // Enforce absolute type casting for numeric values from input elements
  if (rawPayload.price?.amount) {
    rawPayload.price.amount = Number(rawPayload.price.amount);
  }

  if (rawPayload.details) {
    const d = rawPayload.details;
    if (d.bedroom) d.bedroom = Number(d.bedroom);
    if (d.bathroom) d.bathroom = Number(d.bathroom);
    if (d.toilet) d.toilet = Number(d.toilet);
    if (d.living_room) d.living_room = Number(d.living_room);
    if (d.parking_space) d.parking_space = Number(d.parking_space);
    if (d.total_floors) d.total_floors = Number(d.total_floors);
    
    // Explicitly parse float or drop land_area field entirely if it's missing
    if (d.land_area && d.land_area !== '') {
      d.land_area = parseFloat(d.land_area);
    } else {
      delete d.land_area;
    }
  }

  // Remove keys with empty properties so they are completely absent from the network request
  const input = cleanGraphQLInput(rawPayload);

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
  const listingId = await createDraft(basic, media, location ?? undefined);
  
  await uploadImages(listingId, media.images);
  
  if (submit) {
    return submitListing(listingId);
  }
  return { id: listingId };
}