"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ListingController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const listing_service_1 = require("./listing.service");
const create_listing_dto_1 = require("./dto/create-listing.dto");
const filter_listings_dto_1 = require("./dto/filter-listings.dto");
const create_report_dto_1 = require("./dto/create-report.dto");
const create_contact_dto_1 = require("./dto/create-contact.dto");
const multer_config_1 = require("../common/multer/multer.config");
const auth_guard_1 = require("../auth/auth.guard");
const role_1 = require("../user/role");
const mongoose_1 = require("mongoose");
const reject_listing_dto_1 = require("./dto/reject-listing.dto");
const success_interceptors_1 = require("../common/interceptors/success.interceptors");
const listing_payload_interceptor_1 = require("./listing-payload.interceptor");
const contact_log_dto_1 = require("./dto/contact-log.dto");
const listingExpiration_util_1 = require("../utils/listingExpiration.util");
let ListingController = ListingController_1 = class ListingController {
    listingService;
    logger = new common_1.Logger(ListingController_1.name);
    constructor(listingService) {
        this.listingService = listingService;
    }
    async findMyListings(req) {
        if (!req.user) {
            throw new common_1.UnauthorizedException('No authenticated user');
        }
        if (!req.user.realtorId) {
            throw new common_1.BadRequestException('Realtor ID missing in token — please re-login');
        }
        if (!mongoose_1.Types.ObjectId.isValid(req.user.realtorId)) {
            throw new common_1.BadRequestException(`Invalid realtor ID format: ${req.user.realtorId}`);
        }
        return await this.listingService.findListings(req.user.realtorId);
    }
    async create(req, createListingDto, files = {}, submit) {
        if (!req.user?.realtorId) {
            throw new common_1.UnauthorizedException('Only realtors can create listings');
        }
        const realtorId = req.user.realtorId;
        const uploadedImages = files.images || [];
        return await this.listingService.createListing(createListingDto, realtorId, {
            images: uploadedImages.length ? uploadedImages : undefined,
            submitImmediately: submit === 'true' || submit === '1',
        });
    }
    async submitListing(id, request) {
        const realtorId = request.user?.realtorId;
        if (!realtorId) {
            throw new common_1.BadRequestException('Missing realtor _id for the logged-in user');
        }
        if (!mongoose_1.Types.ObjectId.isValid(realtorId)) {
            throw new common_1.BadRequestException('Invalid realtor _id');
        }
        return this.listingService.submitListing(id, realtorId);
    }
    async updateListing(id, updateData, request) {
        return await this.listingService.updateListing(id, request.user.realtorId, updateData);
    }
    async deleteListing(id, req) {
        if (!req.user.realtorId) {
            throw new common_1.UnauthorizedException('Not a realtor');
        }
        return await this.listingService.deleteListing(id, req.user.realtorId);
    }
    async renewListing(id, req) {
        return await this.listingService.renewListing({
            listingId: id,
            userId: req.user.id,
        });
    }
    async findListings(query) {
        return await this.listingService.findPublicListings(query);
    }
    async findFeaturedListings(limit) {
        return await this.listingService.findFeaturedListings(limit);
    }
    async findListing(id) {
        return await this.listingService.findPublicListingById(id);
    }
    async reportListing(id, body) {
        this.logger.log('[REPORT] Public report received for listing:', id);
        this.logger.log('[REPORT] Form data:', body);
        return await this.listingService.createReport({ ...body, listing: id });
    }
    async contactRealtor(id, body) {
        const listingDoc = await this.listingService.findListingById(id, {
            raw: true,
        });
        if (!listingDoc.isPublished ||
            (0, listingExpiration_util_1.isListingExpired)(listingDoc.publishedAt, new Date(), listingDoc.expiresAt)) {
            throw new common_1.NotFoundException('Listing not available');
        }
        return this.listingService.contactRealtor(listingDoc, body);
    }
    async logRealtorContact(id, body, req) {
        return this.listingService.createContactLog(id, body, req.user?.id);
    }
    async uploadListingImage(id, files, req) {
        const imageFiles = files?.images ?? [];
        if (imageFiles.length === 0) {
            throw new common_1.BadRequestException('No images provided');
        }
        return this.listingService.addImagesToListing({
            listingId: id,
            realtorId: req.user.realtorId,
            files: imageFiles,
        });
    }
    async publishListing(id, req) {
        return await this.listingService.publishListing(id, req.user);
    }
    async setFeaturedListings(listingIds, req) {
        if (req.user.role !== role_1.Role.ADMIN) {
            throw new common_1.UnauthorizedException('Admin access required');
        }
        return await this.listingService.setFeaturedListings(listingIds);
    }
    async getPendingListings(req) {
        if (!req.user?.role) {
            throw new common_1.UnauthorizedException('No role found in token');
        }
        if (req.user.role !== role_1.Role.ADMIN) {
            throw new common_1.UnauthorizedException(`Role mismatch. Expected: ${role_1.Role.ADMIN}, Got: ${req.user.role} (type: ${typeof req.user.role})`);
        }
        return this.listingService.findPendingListings(req.user);
    }
    async rejectListing(id, dto, req) {
        if (req.user.role !== role_1.Role.ADMIN) {
            throw new common_1.UnauthorizedException('Admin access required');
        }
        return this.listingService.rejectListing(id, dto, req.user);
    }
    async getListingReports(id, req) {
        if (req.user.role !== role_1.Role.ADMIN) {
            throw new common_1.UnauthorizedException();
        }
        return await this.listingService.getListingReports(id);
    }
    async findListingsByRealtor(id, req) {
        if (req.user.role !== role_1.Role.ADMIN) {
            throw new common_1.UnauthorizedException();
        }
        return this.listingService.findListings(id);
    }
};
exports.ListingController = ListingController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('my'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ListingController.prototype, "findMyListings", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)(),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new property listing (Realtor only)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                listing: {
                    type: 'string',
                    description: 'Optional JSON-encoded listing fields. Flat form fields remain supported.',
                    example: '{"title":"Apartment","price":{"amount":5000000},"location":{"state":"Lagos"}}',
                },
                images: {
                    type: 'array',
                    maxItems: multer_config_1.MAX_LISTING_IMAGES,
                    items: { type: 'string', format: 'binary' },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Listing created successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - not a realtor' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([{ name: 'images', maxCount: multer_config_1.MAX_LISTING_IMAGES }], multer_config_1.multerConfig), new listing_payload_interceptor_1.ListingPayloadInterceptor()),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, common_1.Query)('submit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_listing_dto_1.CreateListingDto, Object, String]),
    __metadata("design:returntype", Promise)
], ListingController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)(':id/submit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ListingController.prototype, "submitListing", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ListingController.prototype, "updateListing", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ListingController.prototype, "deleteListing", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Patch)(':id/renew'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ListingController.prototype, "renewListing", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all published property listings (Public)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of published properties',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_listings_dto_1.FilterListingsDto]),
    __metadata("design:returntype", Promise)
], ListingController.prototype, "findListings", null);
__decorate([
    (0, common_1.Get)('featured'),
    (0, swagger_1.ApiOperation)({ summary: 'Get featured property listings (Public)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of featured properties',
    }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ListingController.prototype, "findFeaturedListings", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single property listing by ID (Public)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Property listing details',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Listing not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ListingController.prototype, "findListing", null);
__decorate([
    (0, common_1.Post)(':id/report'),
    (0, swagger_1.ApiOperation)({ summary: 'Report a property listing (Public)' }),
    (0, swagger_1.ApiBody)({ type: create_report_dto_1.CreateReportDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Report submitted successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_report_dto_1.CreateReportDto]),
    __metadata("design:returntype", Promise)
], ListingController.prototype, "reportListing", null);
__decorate([
    (0, common_1.Post)(':id/contact'),
    (0, swagger_1.ApiOperation)({ summary: 'Contact realtor about a property (Public)' }),
    (0, swagger_1.ApiBody)({ type: create_contact_dto_1.CreateContactDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Contact message sent successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Listing not available' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_contact_dto_1.CreateContactDto]),
    __metadata("design:returntype", Promise)
], ListingController.prototype, "contactRealtor", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.OptionalAuthGuard),
    (0, common_1.Post)(':id/contact-log'),
    (0, swagger_1.ApiOperation)({ summary: 'Log a contact attempt to a realtor (Public)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, contact_log_dto_1.ContactLogDto, Object]),
    __metadata("design:returntype", Promise)
], ListingController.prototype, "logRealtorContact", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)(':id/images'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([{ name: 'images', maxCount: multer_config_1.MAX_LISTING_IMAGES }], multer_config_1.multerConfig)),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ListingController.prototype, "uploadListingImage", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Patch)(':id/publish'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ListingController.prototype, "publishListing", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Put)('admin/featured'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Set featured listings (Admin only) — replaces all previous featured listings',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                listingIds: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
                },
            },
            required: ['listingIds'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Featured listings updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Admin access required' }),
    __param(0, (0, common_1.Body)('listingIds')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], ListingController.prototype, "setFeaturedListings", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('/admin/pending'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ListingController.prototype, "getPendingListings", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Patch)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reject_listing_dto_1.RejectListingDto, Object]),
    __metadata("design:returntype", Promise)
], ListingController.prototype, "rejectListing", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(':id/report'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ListingController.prototype, "getListingReports", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('realtor/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ListingController.prototype, "findListingsByRealtor", null);
exports.ListingController = ListingController = ListingController_1 = __decorate([
    (0, swagger_1.ApiTags)('Listings'),
    (0, common_1.UseInterceptors)(success_interceptors_1.SuccessInterceptor),
    (0, common_1.Controller)('listings'),
    __metadata("design:paramtypes", [listing_service_1.ListingService])
], ListingController);
//# sourceMappingURL=listing.controller.js.map