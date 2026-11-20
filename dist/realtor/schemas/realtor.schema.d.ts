import { HydratedDocument, Types } from 'mongoose';
import { User } from "../../user/schemas/user.schema";
import { KYC } from './kyc.schema';
export declare enum VERIFICATION_STATUS {
    NOT_VERIFIED = "NOT_VERIFIED",
    PENDING = "PENDING",
    VERIFIED = "VERIFIED"
}
export declare class Realtor {
    user: User;
    realtor_pic: string;
    is_founding_realtor: boolean;
    bio: string;
    company: string;
    office_address: string;
    service_area: string;
    mobile_number: string;
    whatsapp_number: string;
    socials: Map<string, string>;
    kyc: KYC;
    rating: number;
    verification_status: VERIFICATION_STATUS;
}
export type RealtorDocument = HydratedDocument<Realtor>;
export declare const RealtorSchema: import("mongoose").Schema<Realtor, import("mongoose").Model<Realtor, any, any, any, import("mongoose").Document<unknown, any, Realtor> & Realtor & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Realtor, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Realtor>> & import("mongoose").FlatRecord<Realtor> & {
    _id: Types.ObjectId;
}>;
