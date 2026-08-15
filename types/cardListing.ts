import { StaticImageData } from "next/image";

// 💡 Sub-interface to neatly parse nested user/realtor data structures
export interface IRealtorData {
  id: string;
  _id?: string;
  realtor_pic: string | StaticImageData;
  user: {
    id: string;
    full_name: string;
  };
}

// 💡 Sub-interface for spatial mapping coordinates
export interface IGeoLocation {
  type: "Point" | string;
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IPropertyDetails {
  bedroom: number;
  bathroom: number;
  land_area: string;
  area_suffix?: string;
  parking_space: number;
  features: string[];
}

export interface IPropertyPrice {
  amount: number;
  per: string; // e.g., "annum", "month"
}

// Core unified layout model
export type Listing = {
  id: string;
  _id: string;
  title: string;
  description?: string;
  property_category: string;
  property_type: string;
  status: 'sale' | 'rent';
  featured?: boolean;
  address: string;
  city: string;
  state: string;
  videoLink?: string;
  street_view: boolean;
  createdAt: string;
  publishedAt?: string;
  expiresAt?: string;
  
  // Nested Objects
  location: IGeoLocation;
  realtor: IRealtorData;
  price: IPropertyPrice;
  details: IPropertyDetails;
  
  // Media Assets
  cover_image: string | StaticImageData;
  images: Array<string | StaticImageData>;
  
  // Administrative & State Management Fields
  checked?: boolean;
  draft?: boolean;
  published_status?: 'published' | 'pending' | 'disapproved';
  report?: string[];
};