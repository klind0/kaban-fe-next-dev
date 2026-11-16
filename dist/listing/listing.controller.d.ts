import { ListingService } from './listing.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { FilterListingsDto } from './dto/filter-listings.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import RequestWithUser from "../auth/requestWithUser.interface";
import { Types } from 'mongoose';
import { RejectListingDto } from './dto/reject-listing.dto';
import { ContactLogDto } from './dto/contact-log.dto';
export declare class ListingController {
    private readonly listingService;
    private readonly logger;
    constructor(listingService: ListingService);
    findMyListings(req: RequestWithUser): Promise<{
        data: import("./dto/listing-response.dto").ListingResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            search: string;
        };
    }>;
    create(req: RequestWithUser, createListingDto: CreateListingDto, files?: {
        images?: Express.Multer.File[];
    }, submit?: string): Promise<import("./dto/listing-response.dto").ListingResponseDto>;
    submitListing(id: string, request: RequestWithUser): Promise<{
        message: string;
    }>;
    updateListing(id: string, updateData: Partial<CreateListingDto>, request: RequestWithUser): Promise<import("./dto/listing-response.dto").ListingResponseDto>;
    deleteListing(id: string, req: RequestWithUser): Promise<import("./dto/listing-response.dto").ListingResponseDto>;
    renewListing(id: string, req: RequestWithUser): Promise<import("./dto/listing-response.dto").ListingResponseDto>;
    findListings(query: FilterListingsDto): Promise<{
        data: import("./dto/listing-response.dto").ListingResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            search: string;
        };
    }>;
    findFeaturedListings(limit?: number): Promise<{
        data: import("./dto/listing-response.dto").ListingResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            search: any;
        };
    }>;
    findListing(id: string): Promise<import("./dto/listing-response.dto").ListingResponseDto>;
    reportListing(id: string, body: CreateReportDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/report.schema").Report> & import("./schemas/report.schema").Report & {
        _id: Types.ObjectId;
    }>;
    contactRealtor(id: string, body: CreateContactDto): Promise<{
        success: boolean;
        message: string;
        realtor: {
            name: string;
            email: string;
            mobile_number: string;
            whatsapp_number: string;
        };
    }>;
    logRealtorContact(id: string, body: ContactLogDto, req: RequestWithUser): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./schemas/contact-log.schema").ContactLog> & import("./schemas/contact-log.schema").ContactLog & {
        _id: Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, import("./schemas/contact-log.schema").ContactLog> & import("./schemas/contact-log.schema").ContactLog & {
        _id: Types.ObjectId;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    uploadListingImage(id: string, files: {
        images?: Express.Multer.File[];
    }, req: RequestWithUser): Promise<import("./dto/listing-response.dto").ListingResponseDto>;
    publishListing(id: string, req: RequestWithUser): Promise<import("./dto/listing-response.dto").ListingResponseDto>;
    setFeaturedListings(listingIds: string[], req: RequestWithUser): Promise<{
        data: import("./dto/listing-response.dto").ListingResponseDto[];
        meta: {
            total: number;
        };
    }>;
    getPendingListings(req: RequestWithUser): Promise<import("./dto/listing-response.dto").ListingResponseDto[]>;
    rejectListing(id: string, dto: RejectListingDto, req: RequestWithUser): Promise<import("./dto/listing-response.dto").ListingResponseDto>;
    getListingReports(id: string, req: RequestWithUser): Promise<(import("mongoose").FlattenMaps<import("./schemas/report.schema").Report> & {
        _id: Types.ObjectId;
    })[]>;
    findListingsByRealtor(id: string, req: RequestWithUser): Promise<{
        data: import("./dto/listing-response.dto").ListingResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            search: string;
        };
    }>;
}
