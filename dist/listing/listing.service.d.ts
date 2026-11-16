import { Model, Types } from 'mongoose';
import { Listing, ListingDocument } from './schemas/listing.schema';
import { CreateListingDto } from './dto/create-listing.dto';
import { FilterListingsDto } from './dto/filter-listings.dto';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ListingResponseDto } from './dto/listing-response.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { CloudinaryService } from "../common/cloudinary/cloudinary.service";
import { ListingExpirationUtil } from "../utils/listingExpiration.util";
import { Role } from "../user/role";
import { RejectListingDto } from './dto/reject-listing.dto';
import { EmailService } from "../email/email.service";
import { ContactLog, ContactLogDocument } from './schemas/contact-log.schema';
import { ContactLogDto } from './dto/contact-log.dto';
type PublicListingsFilter = Omit<FilterListingsDto, 'features' | 'amenities'> & {
    features?: string | string[];
    amenities?: string | string[];
    'details.bedroom'?: number;
    'details.toilet'?: number;
    'details.bathroom'?: number;
    details?: {
        bedroom?: number;
        toilet?: number;
        bathroom?: number;
    };
};
export declare class ListingService {
    private _listingModel;
    private readonly contactLogModel;
    private readonly _reportService;
    private readonly _cloudinaryService;
    private readonly listingExpirationUtil;
    private readonly emailService;
    private readonly logger;
    constructor(_listingModel: Model<ListingDocument>, contactLogModel: Model<ContactLogDocument>, _reportService: ReportService, _cloudinaryService: CloudinaryService, listingExpirationUtil: ListingExpirationUtil, emailService: EmailService);
    createListing(createListingInput: CreateListingDto | Record<string, unknown>, realtorId: string, options?: {
        images?: Express.Multer.File[];
        submitImmediately?: boolean;
    }): Promise<ListingResponseDto>;
    submitListing(listingId: string, realtorId: string): Promise<{
        message: string;
    }>;
    private _submitListing;
    private _assertListingCanBeSubmitted;
    private _getValidationMessages;
    publishListing(listingId: string, user: {
        role: Role;
    }): Promise<ListingResponseDto>;
    findPendingListings(user: {
        role: Role;
    }): Promise<ListingResponseDto[]>;
    rejectListing(id: string, dto: RejectListingDto, user: {
        role: Role;
    }): Promise<ListingResponseDto>;
    findFeaturedListings(limit?: number): Promise<{
        data: ListingResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            search: any;
        };
    }>;
    setFeaturedListings(listingIds: string[]): Promise<{
        data: ListingResponseDto[];
        meta: {
            total: number;
        };
    }>;
    findPublicListings(queryObj?: PublicListingsFilter): Promise<{
        data: ListingResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            search: string;
        };
    }>;
    findPublicListingById(id: string): Promise<ListingResponseDto>;
    contactRealtor(listing: Listing, dto: CreateContactDto): Promise<{
        success: boolean;
        message: string;
        realtor: {
            name: string;
            email: string;
            mobile_number: string;
            whatsapp_number: string;
        };
    }>;
    createContactLog(id: string, dto: ContactLogDto, userId?: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, ContactLog> & ContactLog & {
        _id: Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, ContactLog> & ContactLog & {
        _id: Types.ObjectId;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    findListings(realtorId: string, options?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        listing_state?: string;
    }): Promise<{
        data: ListingResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            search: string;
        };
    }>;
    findListingForEdit(listingId: string, realtorId: string): Promise<ListingResponseDto>;
    findListingById(id: string, options?: {
        raw?: true;
    }): Promise<Listing>;
    findListingById(id: string, options?: {
        raw?: false | undefined;
    }): Promise<ListingResponseDto>;
    updateListing(listingId: string, realtorId: string, updateData: Partial<CreateListingDto>): Promise<ListingResponseDto>;
    deleteListing(id: string, realtorId: string): Promise<ListingResponseDto>;
    renewListing({ listingId, userId, }: {
        listingId: string;
        userId: string;
    }): Promise<ListingResponseDto>;
    createReport(dto: CreateReportDto & {
        listing: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("./schemas/report.schema").Report> & import("./schemas/report.schema").Report & {
        _id: Types.ObjectId;
    }>;
    getListingReports(id: string): Promise<(import("mongoose").FlattenMaps<import("./schemas/report.schema").Report> & {
        _id: Types.ObjectId;
    })[]>;
    private _createFindFilter;
    private _normalizeDetails;
    private _notExpiredFilter;
    private _getListingIdentifierFilter;
    private _titleCase;
    addImagesToListing({ listingId, realtorId, files, }: {
        listingId: string;
        realtorId: string;
        files: Express.Multer.File[];
    }): Promise<ListingResponseDto>;
    private _addImagesToListing;
}
export {};
