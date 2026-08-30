import { IListing } from "@/types/listingTypes";
import {
  createListingAction,
  submitListingAction,
  uploadListingImagesAction,
} from "@/app/actions/listing-actions";
import imageCompression from 'browser-image-compression';

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
    
    if (d.land_area === "" || d.land_area == null){
      delete d.land_area;
    } else {
      d.land_area = String(d.land_area);
    }

    if (!Array.isArray(d.features)) {
      d.features = [];
    } 
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

export async function uploadImages( listingId: string, files: File[], ): Promise<void> {
  if (!files || files.length === 0) {
    console.log("🟡 [NETWORK] No images array provided for upload execution.");
    return;
  }

  const compressionOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  // Stay safely under Vercel ~4.5MB body limit (multipart overhead included)
  const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

  console.log("==========================================");
  console.log(
    `📦 [NETWORK] PROCESSING ${files.length} IMAGE(S) FOR ID: ${listingId}`,
  );

  // 1. Compress large images client-side
  const processedFiles = await Promise.all(
    files.map(async (file) => {
      if (file.size <= 1024 * 1024 || !file.type.startsWith("image/")) {
        console.log(
          `ℹ️ [SKIP COMPRESS] "${file.name}" is already small (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
        );
        return file;
      }

      try {
        console.log(
          `⏳ [COMPRESSING] "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB)...`,
        );
        const compressed = await imageCompression(file, compressionOptions);
        console.log(
          `✅ [COMPRESSED] "${file.name}" -> (${(compressed.size / 1024 / 1024).toFixed(2)} MB)`,
        );
        return compressed;
      } catch (err) {
        console.warn(
          `⚠️ [COMPRESS FAILED] Could not compress "${file.name}". Falling back to original.`,
          err,
        );
        return file;
      }
    }),
  );

  // 2. Reject anything still too large for a single Vercel request
  for (const file of processedFiles) {
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error(
        `"${file.name}" is still too large (${(file.size / 1024 / 1024).toFixed(2)} MB) after compression. Try a smaller image or export as JPEG.`,
      );
    }
  }

  // 3. Upload one file per request (sequential = clearer errors, safer limits)
  console.log(
    `🚀 [UPLOADING] Dispatching ${processedFiles.length} sequential request(s)...`,
  );

  for (let index = 0; index < processedFiles.length; index++) {
    const file = processedFiles[index];
    const formData = new FormData();
    formData.append("images", file);

    console.log(
      `👉 Request #${index + 1} | File: "${file.name}" | Size: ${file.size} bytes`,
    );
    await uploadListingImagesAction(listingId, formData);
  }

  console.log("==========================================");
  console.log(
    `🎉 [NETWORK] ALL IMAGES UPLOADED SUCCESSFULLY FOR ID: ${listingId}`,
  );
}

export async function submitListing(listingId: string): Promise<unknown> {
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