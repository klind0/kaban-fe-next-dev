import { ConfigService } from '@nestjs/config';
import { ListingService } from './listing.service';
import { JWTUtil } from "../utils/jwt.util";
import { UserService } from "../user/user.service";
import { RealtorService } from "../realtor/realtor.service";
export declare class ListingResolver {
    private readonly _listingService;
    private readonly _jwtUtil;
    private readonly _configService;
    private readonly userService;
    private readonly realtorService;
    constructor(_listingService: ListingService, _jwtUtil: JWTUtil, _configService: ConfigService, userService: UserService, realtorService: RealtorService);
    publicListings(filter?: Record<string, any>): Promise<{
        data: import("./dto/listing-response.dto").ListingResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            search: string;
        };
    }>;
    publicListing(id: string): Promise<import("./dto/listing-response.dto").ListingResponseDto>;
    featuredListings(limit?: number): Promise<{
        data: import("./dto/listing-response.dto").ListingResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            search: any;
        };
    }>;
    myListings(context: {
        req: any;
    }, page?: number, limit?: number, search?: string, status?: string, listing_state?: string): Promise<{
        data: import("./dto/listing-response.dto").ListingResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            search: string;
        };
    }>;
    getListingForEdit(id: string, context: {
        req: any;
    }): Promise<import("./dto/listing-response.dto").ListingResponseDto>;
    createListing(input: Record<string, unknown>, submit?: boolean, context?: {
        req: any;
    }): Promise<import("./dto/listing-response.dto").ListingResponseDto>;
    submitListing(id: string, context: {
        req: any;
    }): Promise<{
        message: string;
    }>;
    updateListing(id: string, input: Record<string, any>, context: {
        req: any;
    }): Promise<import("./dto/listing-response.dto").ListingResponseDto>;
    deleteListing(id: string, context: {
        req: any;
    }): Promise<import("./dto/listing-response.dto").ListingResponseDto>;
    renewListing(id: string, context: {
        req: any;
    }): Promise<import("./dto/listing-response.dto").ListingResponseDto>;
    reportListing(id: string, input: Record<string, any>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/report.schema").Report> & import("./schemas/report.schema").Report & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    contactRealtor(id: string, input: Record<string, any>): Promise<{
        success: boolean;
        message: string;
        realtor: {
            name: string;
            email: string;
            mobile_number: string;
            whatsapp_number: string;
        };
    }>;
    publishListing(id: string, context: {
        req: any;
    }): Promise<import("./dto/listing-response.dto").ListingResponseDto>;
    pendingListings(context: {
        req: any;
    }): Promise<{
        data: import("./dto/listing-response.dto").ListingResponseDto[];
        meta: {
            total: number;
        };
    }>;
    rejectListing(id: string, input: Record<string, any>, context: {
        req: any;
    }): Promise<import("./dto/listing-response.dto").ListingResponseDto>;
    setFeaturedListings(listingIds: string[], context: {
        req: any;
    }): Promise<{
        data: import("./dto/listing-response.dto").ListingResponseDto[];
        meta: {
            total: number;
        };
    }>;
    listingReports(id: string, context: {
        req: any;
    }): Promise<(import("mongoose").FlattenMaps<import("./schemas/report.schema").Report> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    listingsByRealtor(id: string, page?: number, limit?: number, context?: {
        req: any;
    }): Promise<{
        data: import("./dto/listing-response.dto").ListingResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            search: string;
        };
    }>;
    private _assertAdmin;
    private _getUserFromContext;
}
