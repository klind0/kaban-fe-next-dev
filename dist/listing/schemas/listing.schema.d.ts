import { HydratedDocument, Types } from 'mongoose';
import { Realtor } from "../../realtor/schemas/realtor.schema";
import { Detail, ListingState, Location, PropertyCategory, PropertyType, Status } from '../listing.interface';
export declare class Listing {
    id: string;
    realtor: Realtor;
    property_id: string;
    title: string;
    description: string;
    property_category: PropertyCategory;
    property_type: PropertyType;
    status: Status;
    price: {
        amount: number;
        per: string;
    };
    images: {
        url: string;
        publicId: string;
    }[];
    cover_image: string;
    video: string;
    details: Detail;
    location: Location;
    street_view: boolean;
    rejectionReasons: string[];
    approvalNotes?: string | null;
    isPublished: boolean;
    publishedAt: Date;
    expiresAt: Date;
    listing_state: ListingState;
    expiredNotified: boolean;
    isFeatured: boolean;
}
declare const ListingSchema: import("mongoose").Schema<Listing, import("mongoose").Model<Listing, any, any, any, import("mongoose").Document<unknown, any, Listing> & Listing & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Listing, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Listing>> & import("mongoose").FlatRecord<Listing> & {
    _id: Types.ObjectId;
}>;
export type ListingDocument = HydratedDocument<Listing>;
export { ListingSchema };
