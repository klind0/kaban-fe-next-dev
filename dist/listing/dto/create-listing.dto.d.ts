import { PropertyCategory, PropertyType, Status } from '../listing.interface';
export declare const AMENITY_VALUES: readonly ["swimming-pool", "fitted-kitchen", "in-built-speaker", "en-suite", "boys-quarter", "gym", "cctv-cameras", "security", "pre-paid-meter", "furnished", "24-hrs-electricity", "installed-wardrobe", "laundry-room", "elevator", "walk-in-closet", "family-room"];
export declare class ImageDto {
    url: string;
    publicId: string;
}
export declare class PriceDto {
    amount: number;
    per?: string;
}
export declare class LocationDto {
    address?: string;
    state?: string;
    city?: string;
    landmark?: string;
    coordinates?: number[];
}
export declare class DetailInputDto {
    bedroom?: number;
    toilet?: number;
    bathroom?: number;
    living_room?: number;
    land_area?: string;
    parking_space?: number;
    features?: string[];
}
export declare class CreateListingDto {
    property_id: string;
    title: string;
    description: string;
    property_category: PropertyCategory;
    property_type: PropertyType;
    status: Status;
    price: PriceDto;
    location: LocationDto;
    cover_image: string;
    images: any[];
    video: string;
    details: DetailInputDto;
    street_view: boolean;
}
