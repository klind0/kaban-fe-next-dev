// --- 1. BACKEND DOMAIN DICTIONARY & TYPES ---

export const propertyCategory = {
  commercial: [
    'Land',
    'Shop',
    'Hotel',
    'Office',
    'Supermarket/Mall',
    'Filling Station',
    'Restaurant',
    'Event Centre',
    'School',
  ],
  industrial: ['Factory', 'Power Plant', 'Warehouse', 'Showroom'],
  residential: [
    'Self Contain',
    'Apartment',
    'Detached House',
    'Terrace house',
    'Semi-detached House',
  ],
} as const;

export type PropertyCategory = keyof typeof propertyCategory; // 'commercial' | 'industrial' | 'residential'

export type PropertyType = (typeof propertyCategory)[PropertyCategory][number];

export enum Status {
  sale = 'sale',
  rent = 'rent',
}

export enum ListingState {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum RejectionReason {
  DESCRIPTION = 'description',
  PRICE = 'price',
  DETAILS = 'details',
  IMAGE = 'image',
  LOCATION = 'location',
  MAP = 'map',
  DUPLICATE = 'duplicate',
  TOS_VIOLATION = 'tos_violation',
}

export type Detail = {
  bedroom: number;
  bathroom: number;
  toilet: number;
  living_room: number;
  land_area: string;
  parking_space: number;
  features: string[];
};

export type Location = {
  address: string;
  state: string;
  city: string;
  landmark: string;
  coordinates: [number, number]; // 👈 Non-nullable coordinate tuple
};

// --- 2. FRONTEND LISTING INTERFACES ---

export interface IListing {
  id: string;
  title: string;
  property_id: string;
  description: string;
  property_category: PropertyCategory;
  property_type: PropertyType;
  status: Status | "sale" | "rent";
  price: {
    amount: number;
    per: string;
  };
  details: Detail;
  images: {
    url: string;
  }[];
  cover_image: string;
  video?: string;
  location: Location;
  street_view: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  publishedAt: string | null;
  expiresAt: string | null;
  realtor: {
    full_name: string;
    email: string;
    mobile_number: string;
    whatsapp_number: string;
    realtor_pic?: string | null;
    is_founding_realtor?: boolean;
  };
  rejectionReasons: RejectionReason[] | string[];
  approvalNotes: string | null;
  listing_state: ListingState;
  effectiveState: ListingState;
}

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