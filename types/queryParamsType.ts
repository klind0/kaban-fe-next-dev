export interface IQueryParamsType {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  priceMin?: number;
  priceMax?: number;
  category?: "rent" | "sale";
  tab?: string;
}

// Add any additional query parameters as needed
