import { ListingState, PropertyCategory, PropertyType, Status } from '@/types/listingTypes';

export interface IQueryParamsType {
  status?: Status | 'rent' | 'sale';
  listing_state?: ListingState;
  effectiveState?: ListingState;
  category?: PropertyCategory;
  property_type?: PropertyType | string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  bedroom?: number;
  bathrooms?: number;
  priceMin?: number;
  priceMax?: number;
  tab?: string;
  radius?: number;
  roomNo?: string;
  price?: string;
  min_price?: number;
  max_price?: number;
  features?: string[];
}