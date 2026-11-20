import { ListingState, Status } from '../listing.interface';
export declare class RealtorInfoDto {
    full_name: string;
    email: string;
    mobile_number: string;
    whatsapp_number: string;
    realtor_pic?: string;
    is_founding_realtor?: boolean;
}
export declare class PriceDto {
    amount: number;
    per?: string;
}
export declare class ListingImageDto {
    url: string;
}
export declare class DetailDto {
    bedroom?: number;
    toilet?: number;
    bathroom?: number;
    living_room?: number;
    land_area?: string;
    parking_space?: number;
    features?: string[];
}
export declare class LocationDto {
    address: string;
    state: string;
    city: string;
    landmark: string;
    coordinates: number[];
}
export declare class ListingResponseDto {
    id: string;
    title: string;
    property_id: string;
    description: string;
    property_category: string;
    property_type: string;
    status: Status;
    price: PriceDto;
    details: DetailDto;
    images: ListingImageDto[];
    cover_image: string;
    video: string;
    location: LocationDto;
    street_view: boolean;
    isFeatured: boolean;
    isPublished: boolean;
    createdAt: string;
    publishedAt: string | null;
    expiresAt: string | null;
    realtor: RealtorInfoDto;
    rejectionReasons: string[];
    approvalNotes: string | null;
    listing_state: ListingState;
    effectiveState?: ListingState;
}
