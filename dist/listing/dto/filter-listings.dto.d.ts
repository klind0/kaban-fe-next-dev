import { PropertyCategory, PropertyType, Status } from '../listing.interface';
export declare class FilterListingsDto {
    search?: string;
    page?: number;
    limit?: number;
    latitude?: number;
    longitude?: number;
    radius?: number;
    location?: string;
    status?: Status;
    property_type?: PropertyType;
    property_category?: PropertyCategory;
    category?: PropertyCategory;
    bedroom?: number;
    toilet?: number;
    toilets?: number;
    bathroom?: number;
    min_price?: number;
    max_price?: number;
    realtor?: string;
    street_view?: string;
    features?: string;
    amenities?: string | string[];
}
