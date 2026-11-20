import { HydratedDocument } from 'mongoose';
export declare class KYC {
    government_id?: string;
    realtor_certification?: string;
}
export type KYCDocument = HydratedDocument<KYC>;
export declare const KYCSchema: import("mongoose").Schema<KYC, import("mongoose").Model<KYC, any, any, any, import("mongoose").Document<unknown, any, KYC> & KYC & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, KYC, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<KYC>> & import("mongoose").FlatRecord<KYC> & {
    _id: import("mongoose").Types.ObjectId;
}>;
