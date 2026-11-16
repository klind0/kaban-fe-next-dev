import { HydratedDocument, Types } from 'mongoose';
export declare class ContactLog {
    listingId: Types.ObjectId;
    realtorId: Types.ObjectId;
    contactType: 'call' | 'whatsapp' | 'email';
    user?: Types.ObjectId | null;
}
export type ContactLogDocument = HydratedDocument<ContactLog>;
export declare const ContactLogSchema: import("mongoose").Schema<ContactLog, import("mongoose").Model<ContactLog, any, any, any, import("mongoose").Document<unknown, any, ContactLog> & ContactLog & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ContactLog, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<ContactLog>> & import("mongoose").FlatRecord<ContactLog> & {
    _id: Types.ObjectId;
}>;
