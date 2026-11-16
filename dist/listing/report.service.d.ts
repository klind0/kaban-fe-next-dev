import { Model, Types } from 'mongoose';
import { Report } from './schemas/report.schema';
import { CreateReportDto } from './dto/create-report.dto';
import { FilterReportsDto } from './dto/filter-reports.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { EmailService } from "../email/email.service";
import { Listing } from "./schemas/listing.schema";
export declare class ReportService {
    private readonly _reportModel;
    private readonly emailService;
    private readonly _listingModel;
    constructor(_reportModel: Model<Report>, emailService: EmailService, _listingModel: Model<Listing>);
    create(createReportDto: CreateReportDto): Promise<import("mongoose").Document<unknown, {}, Report> & Report & {
        _id: Types.ObjectId;
    }>;
    findMany(filter?: FilterReportsDto): Promise<(import("mongoose").FlattenMaps<Report> & {
        _id: Types.ObjectId;
    })[]>;
    findById(id: string): Promise<import("mongoose").Document<unknown, {}, Report> & Report & {
        _id: Types.ObjectId;
    }>;
    update(id: string, fields: UpdateReportDto): Promise<import("mongoose").Document<unknown, {}, Report> & Report & {
        _id: Types.ObjectId;
    }>;
    delete(id: string): Promise<any>;
}
