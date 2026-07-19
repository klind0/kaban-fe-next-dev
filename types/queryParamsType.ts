export interface IQueryParamsType {
  status?: string;
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
  category?: "rent" | "sale";
  tab?: string;
  radius?: number,
  property_type?: string,
  roomNo?: string,
  price?: string,
  min_price?: number,
  max_price?: number,
  features?: string[],
}