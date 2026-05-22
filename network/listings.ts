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

function omitEmptyStrings(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([, v]) => v !== '' && v !== null && v !== undefined)
      .map(([k, v]) =>
        typeof v === 'object' && !Array.isArray(v) && v !== null
          ? [k, omitEmptyStrings(v as Record<string, unknown>)]
          : [k, v]
      )
  );
}

async function createDraft(
  basic: BasicListingData,
  media: MediaListingData,
  location?: LocationListingData,
): Promise<string> {
  const loc = location?.location;
  const hasLocation = loc && (loc.state || loc.city || loc.address);

  const input = omitEmptyStrings({
    ...basic,
    ...(hasLocation ? location : {}),
    cover_index: media.cover_index,
    ...(media.video_url ? { video_url: media.video_url } : {}),
  } as Record<string, unknown>);

  const result = await createListingAction(input);
  return result.id;
}

async function uploadImages(listingId: string, files: File[]): Promise<void> {
  if (!files || files.length === 0) return;

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });

  // Log explicitly what is inside the FormData object
  console.log("📦 Packaging FormData for Server Action:");
  for (let [key, value] of formData.entries()) {
    console.log(`Key: ${key} | Is File? ${value instanceof File} | Name: ${(value as File).name}`);
  }

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