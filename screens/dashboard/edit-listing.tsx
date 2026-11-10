"use client";

import BasicInformationForm, {
  BasicFormHandle,
} from "@/components/dashboard/create-listing/basic-information-form";
import LocationForm, {
  LocationFormHandle,
} from "@/components/dashboard/create-listing/location-form";
import MediaForm, {
  MediaFormHandle,
} from "@/components/dashboard/create-listing/media-form";
import DashboardNavbar from "@/components/dashboard/dashboard-navbar";
import DashboardPageContainer from "@/components/dashboard/dashboard-page-container";
import { Button } from "@/components/ui/button";
import CustomTab from "@/components/universal/custom-tab";
import { useQueryParams } from "@/hooks/useQueryParams";
import {
  BasicListingData,
  LocationListingData,
  MediaListingData,
  ListingImageItem,
  uploadImages,
  submitListing,
} from "@/network/listings";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { gqlRequest } from "@/network/graphql-client";

const tabOptions = [
  { name: "Basic", value: "basic" },
  { name: "Media", value: "media" },
  { name: "Location", value: "location" },
];

const TAB_ORDER = ["basic", "media", "location"] as const;
type TabType = (typeof TAB_ORDER)[number];

type ListingForEdit = {
  title?: string | null;
  description?: string | null;
  property_category?: string | null;
  property_type?: string | null;
  status?: string | null;
  price?:
    | number
    | { amount?: number | string | null; per?: string | null }
    | null;
  details?: {
    bedroom?: number | null;
    toilet?: number | null;
    bathroom?: number | null;
    living_room?: number | null;
    land_area?: string | null;
    parking_space?: number | null;
    features?: string[] | null;
  } | null;
  location?: {
    address?: string | null;
    state?: string | null;
    city?: string | null;
    landmark?: string | null;
    coordinates?: unknown;
  } | null;
  images?: unknown[] | null;
  cover_image?: string | null;
  cover_index?: number | null;
  video?: string | null;
  video_url?: string | null;
};

const toTitleCase = (str: string) =>
  str ? str.replace(/\b\w/g, (char) => char.toUpperCase()) : "";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message || fallback;
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message || fallback;
  }
  return fallback;
}

const GET_LISTING_FOR_EDIT_QUERY = `
  query GetListingForEdit($id: String!) {
    getListingForEdit(id: $id)
  }
`;

const UPDATE_LISTING_MUTATION = `
  mutation UpdateListing($id: String!, $input: JSONObject!) {
    updateListing(id: $id, input: $input)
  }
`;

function resolveCoverUrl(
  allImages: ListingImageItem[],
  coverIndex: number,
  existingImages: { url: string; publicId?: string }[],
): string | undefined {
  const coverCandidate = allImages[coverIndex] ?? allImages[0];

  if (typeof coverCandidate === "string") {
    return coverCandidate;
  }

  if (
    coverCandidate &&
    !(coverCandidate instanceof File) &&
    typeof (coverCandidate as { url?: string }).url === "string"
  ) {
    return (coverCandidate as { url: string }).url;
  }

  return existingImages[0]?.url;
}

function getImageUrl(image: unknown): string | undefined {
  if (typeof image === "string") return image;
  if (
    image &&
    typeof image === "object" &&
    "url" in image &&
    typeof image.url === "string"
  ) {
    return image.url;
  }
  return undefined;
}

export default function EditListingScreen() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const listingId = params?.id as string;

  const [activeTab, setActiveTab] = React.useState<TabType>(
    (searchParams.get("tab") as TabType) || "basic",
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { handleQueryParamsChange } = useQueryParams();

  const basicFormRef = React.useRef<BasicFormHandle>(null);
  const mediaFormRef = React.useRef<MediaFormHandle>(null);
  const locationFormRef = React.useRef<LocationFormHandle>(null);

  const [basicInitial, setBasicInitial] =
    React.useState<BasicListingData | null>(null);
  const [mediaInitial, setMediaInitial] =
    React.useState<MediaListingData | null>(null);
  const [liveLocationData, setLiveLocationData] =
    React.useState<LocationListingData | null>(null);

  const draftRef = React.useRef<{
    basic: BasicListingData | null;
    media: MediaListingData | null;
  }>({ basic: null, media: null });

  const isBusy = isSaving || isSubmitting;

  React.useEffect(() => {
    if (!listingId) return;

    async function fetchListingDetails() {
      try {
        setIsLoading(true);

        const data = await gqlRequest<{
          getListingForEdit: ListingForEdit | null;
        }>(
          GET_LISTING_FOR_EDIT_QUERY,
          { id: listingId },
        );

        const rawListing = data?.getListingForEdit;
        if (!rawListing) {
          throw new Error("Listing payload empty or access denied.");
        }

        // GeoJSON [lng, lat] → form [lat, lng]
        const rawCoords = rawListing.location?.coordinates;
        const safeCoordinates: [number, number] =
          Array.isArray(rawCoords) &&
          rawCoords.length === 2 &&
          !rawCoords.some((n: unknown) => Number.isNaN(Number(n)))
            ? [Number(rawCoords[1]), Number(rawCoords[0])]
            : [5.0377, 7.9128];

        const listingLocation: LocationListingData = {
          location: rawListing.location
            ? {
              address: rawListing.location.address || "",
              state: toTitleCase(rawListing.location.state || ""),
              city: toTitleCase(rawListing.location.city || ""),
              landmark: rawListing.location.landmark || "",
              coordinates: safeCoordinates,
            }
            : {
              address: "",
              state: "",
              city: "",
              landmark: "",
              coordinates: [5.0377, 7.9128] as [number, number],
            },
        };

        const parsedBasic: BasicListingData = {
          title: rawListing.title || "",
          description: rawListing.description || "",
          property_category: rawListing.property_category || "",
          property_type: rawListing.property_type || "",
          status: rawListing.status || "",
          price: {
            amount:
              typeof rawListing.price === "object" && rawListing.price !== null
                ? Number(rawListing.price.amount ?? 0)
                : Number(rawListing.price ?? 0),
            per:
              typeof rawListing.price === "object" && rawListing.price !== null
                ? rawListing.price.per || ""
                : "",
          },
          details: {
            bedroom: rawListing.details?.bedroom ?? 0,
            toilet: rawListing.details?.toilet || rawListing.details?.bathroom || 0,
            living_room: rawListing.details?.living_room ?? 0,
            land_area: rawListing.details?.land_area ?? "",
            parking_space: rawListing.details?.parking_space ?? 0,
            features: rawListing.details?.features || [],
          },
        } as BasicListingData;

        // Keep URL strings for existing images (edit supports File | string | {url})
        const mappedImages: ListingImageItem[] = Array.isArray(rawListing.images)
          ? rawListing.images
              .map(getImageUrl)
              .filter((url): url is string => Boolean(url))
          : [];

        const parsedMedia: MediaListingData = {
          images:
            mappedImages.length > 0
              ? mappedImages
              : rawListing.cover_image
                ? [rawListing.cover_image]
                : [],
          cover_index: rawListing.cover_index || 0,
          video_url: rawListing.video || rawListing.video_url || "",
        };

        setBasicInitial(parsedBasic);
        setMediaInitial(parsedMedia);
        setLiveLocationData(listingLocation);

        draftRef.current.basic = parsedBasic;
        draftRef.current.media = parsedMedia;
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, "Failed to load listing details."));
      } finally {
        setIsLoading(false);
      }
    }

    fetchListingDetails();
  }, [listingId]);

  const handleLocationSubmit = React.useCallback(
    async (
      data?: LocationListingData,
      submit: boolean = true,
    ) => {
      const liveBasic = basicFormRef.current?.getValues?.();
      const liveMedia = mediaFormRef.current?.getValues?.();

      const basic = liveBasic || draftRef.current.basic || basicInitial;
      const media = liveMedia || draftRef.current.media || mediaInitial;
      const effectiveLocation = data ?? liveLocationData;

      if (submit) {
        const targetLoc = effectiveLocation?.location;
        if (!targetLoc?.address || !targetLoc?.state) {
          toast.error("Please fill out all required location fields.");
          return;
        }
      }

      if (!basic) {
        toast.error("Please complete basic property information first.");
        return;
      }

      const allImages: ListingImageItem[] = [
        ...((media?.images as ListingImageItem[]) || []),
      ];
      let coverIndex =
        typeof media?.cover_index === "number" ? media.cover_index : 0;

      // Normalize cover to index 0 for consistent payload order
      if (coverIndex > 0 && coverIndex < allImages.length) {
        const [coverItem] = allImages.splice(coverIndex, 1);
        allImages.unshift(coverItem);
        coverIndex = 0;
      }
      const newFileIsCover = allImages[0] instanceof File;

      const newFiles = allImages.filter(
        (img): img is File => img instanceof File,
      );

      const existingImages = allImages
        .filter((img) => !(img instanceof File))
        .map((img) => {
          if (typeof img === "string") return { url: img };
          if (img && typeof img === "object" && "url" in img && typeof img.url === "string") {
            return {
              url: img.url,
              ...("publicId" in img && typeof img.publicId === "string"
                ? { publicId: img.publicId }
                : {}),
            };
          }
          return null;
        })
        .filter(
          (x): x is { url: string; publicId?: string } => Boolean(x?.url),
        );

      const cover_image = resolveCoverUrl(
        allImages,
        coverIndex,
        existingImages,
      );

      if (submit) setIsSubmitting(true);
      else setIsSaving(true);

      try {
        const locObj = effectiveLocation?.location;

        // 1) Update first — replace gallery with remaining existing images + cover
        const updateInput = {
          title: basic.title || "Untitled Listing",
          description: basic.description || "",
          property_category: basic.property_category,
          property_type: basic.property_type,
          status: basic.status,
          price: {
            amount: Number(
              typeof basic.price === "object"
                ? basic.price?.amount
                : basic.price,
            ),
            per:
              typeof basic.price === "object"
                ? basic.price?.per || ""
                : "",
          },
          details: basic.details || {},
          images: existingImages, // remaining only (removals applied here)
          cover_image,
          cover_index: coverIndex,
          video: media?.video_url || "",
          location: {
            address: locObj?.address,
            state: locObj?.state,
            city: locObj?.city,
            landmark: locObj?.landmark,
            coordinates:
              Array.isArray(locObj?.coordinates) &&
              locObj.coordinates.length === 2
                ? [
                    Number(locObj.coordinates[1]),
                    Number(locObj.coordinates[0]),
                  ]
                : undefined,
          },
        };

        await gqlRequest(UPDATE_LISTING_MUTATION, {
          id: listingId,
          input: updateInput,
        });

        // 2) Then append only new Files (addImagesToListing pushes — not wiped)
        if (newFiles.length > 0) {
          await uploadImages(listingId, newFiles);
        }

        if (newFileIsCover) {
          const refreshed = await gqlRequest<{
            getListingForEdit: {
              images?: unknown[];
              cover_image?: unknown;
            } | null;
          }>(GET_LISTING_FOR_EDIT_QUERY, { id: listingId });
          const refreshedListing = refreshed.getListingForEdit;
          const retainedImageUrls = new Set(
            existingImages.map((image) => image.url),
          );
          const uploadedCoverUrl =
            refreshedListing?.images
              ?.map(getImageUrl)
              .find((url) => url && !retainedImageUrls.has(url)) ??
            (() => {
              const url = getImageUrl(refreshedListing?.cover_image);
              return url && !retainedImageUrls.has(url) ? url : undefined;
            })();

          if (!uploadedCoverUrl) {
            throw new Error(
              "Photos were uploaded, but the selected cover image could not be confirmed. Please try saving again.",
            );
          }

          await gqlRequest(UPDATE_LISTING_MUTATION, {
            id: listingId,
            input: { cover_image: uploadedCoverUrl, cover_index: 0 },
          });
        }

        // 3) Optional submit for review
        if (submit) {
          await submitListing(listingId);
        }

        toast.success(
          submit
            ? "Listing submitted successfully!"
            : "Edits saved successfully!",
        );
        router.push("/dashboard");
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, "Failed to save updates."));
      } finally {
        setIsSaving(false);
        setIsSubmitting(false);
      }
    },
    [
      listingId,
      basicInitial,
      mediaInitial,
      liveLocationData,
      router,
    ],
  );

  // Desktop navbar + mobile sidebar share the same save handler
  React.useEffect(() => {
    if (!listingId) return;

    const onNavbarSave = () => {
      const loc = locationFormRef.current?.getValues?.() ?? undefined;
      void handleLocationSubmit(loc, false);
    };

    window.addEventListener("trigger-navbar-save", onNavbarSave);
    window.addEventListener("trigger-save-draft", onNavbarSave);

    return () => {
      window.removeEventListener("trigger-navbar-save", onNavbarSave);
      window.removeEventListener("trigger-save-draft", onNavbarSave);
    };
  }, [listingId, handleLocationSubmit]);

  const isTabValid = (
    tabId: TabType,
    submittedLocationData?: LocationListingData,
  ): boolean => {
    const liveBasicValues = basicFormRef.current?.getValues?.() || null;
    const liveMediaValues = mediaFormRef.current?.getValues?.() || null;

    const basic =
      liveBasicValues || draftRef.current.basic || basicInitial;
    const media =
      liveMediaValues || draftRef.current.media || mediaInitial;
    const location = submittedLocationData || liveLocationData;

    switch (tabId) {
      case "basic":
        return !!(
          basic?.title &&
          basic?.property_category &&
          basic?.property_type &&
          basic?.status &&
          basic?.price
        );
      case "media":
        return !!(media?.images && media.images.length > 0);
      case "location": {
        const targetLoc = location?.location;
        return !!(targetLoc?.address && targetLoc?.state);
      }
      default:
        return false;
    }
  };

  const handleTabChange = (targetTab: string) => {
    const cleanTarget = targetTab as TabType;
    const currentIdx = TAB_ORDER.indexOf(activeTab);
    const targetIdx = TAB_ORDER.indexOf(cleanTarget);

    if (targetIdx > currentIdx) {
      if (targetIdx > 0 && !isTabValid("basic")) {
        toast.error("Please fill out all mandatory basic fields.");
        setActiveTab("basic");
        handleQueryParamsChange("tab", "basic");
        return;
      }
      if (cleanTarget === "location" && !isTabValid("media")) {
        toast.error("Please upload at least one image.");
        setActiveTab("media");
        handleQueryParamsChange("tab", "media");
        return;
      }
    }

    setActiveTab(cleanTarget);
    handleQueryParamsChange("tab", cleanTarget);
  };

  if (isLoading) {
    return (
      <DashboardPageContainer>
        <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-neutral-800">
            Retrieving listing record...
          </p>
        </div>
      </DashboardPageContainer>
    );
  }

  return (
    <>
      <DashboardNavbar pageTitle="Edit Listing">
        <Button
          className="hidden md:inline-flex"
          onClick={() => {
            const loc = locationFormRef.current?.getValues() ?? undefined;
            void handleLocationSubmit(loc, false);
          }}
          disabled={isBusy}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </DashboardNavbar>

      <DashboardPageContainer>
        <CustomTab
          items={tabOptions}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        <div className={activeTab !== "basic" ? "hidden" : ""}>
          <BasicInformationForm
            ref={basicFormRef}
            onFormSubmit={(data) => {
              draftRef.current.basic = data;
              handleTabChange("media");
            }}
            initialData={basicInitial || undefined}
          />
        </div>

        <div className={activeTab !== "media" ? "hidden" : ""}>
          <MediaForm
            ref={mediaFormRef}
            onNext={(data) => {
              draftRef.current.media = data;
              handleTabChange("location");
            }}
            onBack={() => handleTabChange("basic")}
            initialData={mediaInitial || undefined}
            isPending={isBusy}
          />
        </div>

        <div className={activeTab !== "location" ? "hidden" : ""}>
          <LocationForm
            ref={locationFormRef}
            onFormSubmit={handleLocationSubmit}
            isSaving={isSaving}
            isSubmitting={isSubmitting}
            isActive={activeTab === "location"}
            onBack={() => handleTabChange("media")}
            initialData={liveLocationData?.location || undefined}
          />
        </div>
      </DashboardPageContainer>

      {/* Full-screen loading overlay — keeps forms mounted */}
      {isBusy && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-sm font-medium text-neutral-800">
            {isSubmitting
              ? "Submitting listing..."
              : "Saving changes..."}
          </p>
          <p className="mt-1 text-xs text-neutral-900">
            This may take a moment while we process your images and details.
          </p>
        </div>
      )}
    </>
  );
}
