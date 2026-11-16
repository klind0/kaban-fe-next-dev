import { HydratedDocument, Types } from 'mongoose';
export declare class Report {
    user?: Types.ObjectId | null;
    listing: Types.ObjectId;
    fullName: string;
    phone?: string;
    email: string;
    reason: string;
    message?: string;
    createdAt: Date;
}
export type ReportDocument = HydratedDocument<Report>;
export declare const ReportSchema: import("mongoose").Schema<Report, import("mongoose").Model<Report, any, any, any, import("mongoose").Document<unknown, any, Report> & Report & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Report, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Report>> & import("mongoose").FlatRecord<Report> & {
    _id: Types.ObjectId;
}>;
