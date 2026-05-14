export interface IListing {
  id: string;
  title: string;
  property_id: string;
  description: string;
  property_category: string;
  property_type: string;
  status: "sale" | "rent";
  price: {
    amount: number;
    per: string;
  };
  details: {
    bedroom: number;
    bathroom: number;
    toilet: number;
    living_room: number;
    land_area: string;
    parking_space: number;
    furnished: boolean;
    serviced: boolean;
    newly_built: boolean;
    year_built: number;
    floor: number;
    total_floors: number;
    features: string[];
  };
  images: {
    url: string;
  }[];
  cover_image: string;
  location: {
    address: string;
    state: string;
    city: string;
    landmark: string;
    coordinates: [number, number];
  };
  street_view: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  expiresAt: string;
  realtor: {
    id: string;
    mobile_number: string | null;
    whatsapp_number: string | null;
    realtor_pic: string | null;
    email: string | null;
    first_name: string;
    last_name: string;
  };
  rejectionReasons: string[];
  approvalNotes: string | null;
  listing_state: ListingState;
  effectiveState: string;
}

export type ListingState =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "PUBLISHED"
  | "REJECTED"
  | "EXPIRED";

export interface IListingMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  search: string | null;
}

export interface IListingResponse {
  data: IListing[];
  meta: IListingMeta;
}

export type IndividualListingResponse = IListing;
