export declare const propertyCategory: {
    readonly commercial: readonly ["Land", "Shop", "Hotel", "Office", "Supermarket/Mall", "Filling Station", "Restaurant", "Event Centre", "School"];
    readonly industrial: readonly ["Factory", "Power Plant", "Warehouse", "Showroom"];
    readonly residential: readonly ["Self Contain", "Apartment", "Detached House", "Terrace house", "Semi-detached House"];
};
export type PropertyCategory = keyof typeof propertyCategory;
export type PropertyType = (typeof propertyCategory)[PropertyCategory][number];
export declare enum Status {
    sale = "sale",
    rent = "rent"
}
export declare enum ListingState {
    DRAFT = "DRAFT",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    PUBLISHED = "PUBLISHED",
    REJECTED = "REJECTED",
    EXPIRED = "EXPIRED"
}
export type Detail = {
    bedroom: number;
    toilet: number;
    bathroom?: number;
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
    coordinates: [number, number] | null;
};
export declare enum RejectionReason {
    DESCRIPTION = "description",
    PRICE = "price",
    DETAILS = "details",
    IMAGE = "image",
    LOCATION = "location",
    MAP = "map",
    DUPLICATE = "duplicate",
    TOS_VIOLATION = "tos_violation"
}
