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
var ListingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const listing_schema_1 = require("./schemas/listing.schema");
const create_listing_dto_1 = require("./dto/create-listing.dto");
const update_listing_dto_1 = require("./dto/update-listing.dto");
const report_service_1 = require("./report.service");
const listing_response_dto_1 = require("./dto/listing-response.dto");
const cloudinary_service_1 = require("../common/cloudinary/cloudinary.service");
const listingExpiration_util_1 = require("../utils/listingExpiration.util");
const role_1 = require("../user/role");
const listing_interface_1 = require("./listing.interface");
const email_service_1 = require("../email/email.service");
const contact_log_schema_1 = require("./schemas/contact-log.schema");
function getCloudinaryPublicId(imageUrl) {
    const match = imageUrl?.match(/^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(.+?)(?:[?#].*)?$/i);
    if (!match) {
        return undefined;
    }
    const pathSegments = match[1].split('/');
    const versionIndex = pathSegments.findIndex((segment) => /^v\d+$/.test(segment));
    if (versionIndex < 0 || versionIndex === pathSegments.length - 1) {
        return undefined;
    }
    const publicIdSegments = pathSegments.slice(versionIndex + 1);
    publicIdSegments[publicIdSegments.length - 1] = publicIdSegments[publicIdSegments.length - 1].replace(/\.[^.]+$/, '');
    return publicIdSegments.join('/') || undefined;
}
const REALTOR_EMAIL_POPULATE = {
    path: 'realtor',
    select: 'user',
    populate: { path: 'user', model: 'User', select: 'email full_name' },
};
let ListingService = ListingService_1 = class ListingService {
    _listingModel;
    contactLogModel;
    _reportService;
    _cloudinaryService;
    listingExpirationUtil;
    emailService;
    logger = new common_1.Logger(ListingService_1.name);
    constructor(_listingModel, contactLogModel, _reportService, _cloudinaryService, listingExpirationUtil, emailService) {
        this._listingModel = _listingModel;
        this.contactLogModel = contactLogModel;
        this._reportService = _reportService;
        this._cloudinaryService = _cloudinaryService;
        this.listingExpirationUtil = listingExpirationUtil;
        this.emailService = emailService;
    }
    async createListing(createListingInput, realtorId, options = {}) {
        if (!mongoose_2.Types.ObjectId.isValid(realtorId)) {
            throw new common_1.BadRequestException('Invalid realtor ID');
        }
        const createListingDto = (0, class_transformer_1.plainToInstance)(create_listing_dto_1.CreateListingDto, createListingInput);
        const validationErrors = await (0, class_validator_1.validate)(createListingDto, {
            whitelist: true,
            forbidNonWhitelisted: true,
        });
        if (validationErrors.length) {
            throw new common_1.BadRequestException(this._getValidationMessages(validationErrors));
        }
        const listing = new this._listingModel({
            ...createListingDto,
            title: this._titleCase(createListingDto.title),
            details: this._normalizeDetails(createListingDto.details),
            realtor: new mongoose_2.Types.ObjectId(realtorId),
            property_id: `KID-${Date.now()}`,
            isPublished: false,
            expiresAt: null,
            listing_state: listing_interface_1.ListingState.DRAFT,
        });
        let uploadedImages = [];
        if (options.images?.length) {
            uploadedImages = await this._cloudinaryService.uploadImages(options.images, { folder: `kaban/listings/${listing.id}` });
            listing.images = [...(listing.images ?? []), ...uploadedImages];
        }
        const saveListing = async () => {
            try {
                return await listing.save();
            }
            catch (error) {
                const cleanupResults = await Promise.allSettled(uploadedImages.map((image) => this._cloudinaryService.deleteImage(image.publicId)));
                cleanupResults.forEach((result) => {
                    if (result.status === 'rejected') {
                        this.logger.error(`Failed to clean up Cloudinary image for listing ${listing.id}`, result.reason instanceof Error
                            ? result.reason.stack
                            : String(result.reason));
                    }
                });
                throw error;
            }
        };
        if (options.submitImmediately) {
            try {
                this._assertListingCanBeSubmitted(listing);
            }
            catch (error) {
                await saveListing();
                throw error;
            }
            listing.listing_state = listing_interface_1.ListingState.PENDING_APPROVAL;
        }
        const saved = await saveListing();
        return (0, class_transformer_1.plainToInstance)(listing_response_dto_1.ListingResponseDto, saved, {
            excludeExtraneousValues: true,
        });
    }
    async submitListing(listingId, realtorId) {
        if (!mongoose_2.Types.ObjectId.isValid(listingId)) {
            throw new common_1.BadRequestException('Invalid listing _id');
        }
        if (!mongoose_2.Types.ObjectId.isValid(realtorId)) {
            throw new common_1.BadRequestException('Invalid realtor _id');
        }
        await this._submitListing(listingId, realtorId);
        return { message: 'Listing submitted for approval' };
    }
    async _submitListing(listingId, realtorId) {
        const filter = {
            _id: new mongoose_2.Types.ObjectId(listingId),
            realtor: new mongoose_2.Types.ObjectId(realtorId),
        };
        const listing = await this._listingModel.findOneAndUpdate({
            ...filter,
            title: { $exists: true, $nin: [null, ''] },
            property_category: { $exists: true, $nin: [null, ''] },
            property_type: { $exists: true, $nin: [null, ''] },
            status: { $exists: true, $nin: [null, ''] },
            'location.address': { $exists: true, $nin: [null, ''] },
            'location.state': { $exists: true, $nin: [null, ''] },
            'location.city': { $exists: true, $nin: [null, ''] },
            'price.amount': { $exists: true, $nin: [null, 0] },
            'images.0': { $exists: true },
        }, { $set: { listing_state: listing_interface_1.ListingState.PENDING_APPROVAL } }, { new: true, runValidators: true });
        if (!listing) {
            const ownedListing = await this._listingModel.findOne(filter);
            if (!ownedListing) {
                throw new common_1.NotFoundException('Listing not found');
            }
            this._assertListingCanBeSubmitted(ownedListing);
            throw new common_1.BadRequestException('Listing is incomplete and cannot be submitted');
        }
        return listing;
    }
    _assertListingCanBeSubmitted(listing) {
        if (!listing.title ||
            !listing.property_category ||
            !listing.property_type ||
            !listing.status ||
            !listing.location?.address ||
            !listing.price?.amount ||
            !listing.location?.state ||
            !listing.location?.city ||
            !listing.images?.length) {
            throw new common_1.BadRequestException('Listing is incomplete and cannot be submitted');
        }
    }
    _getValidationMessages(errors) {
        return errors.flatMap((error) => [
            ...Object.values(error.constraints || {}),
            ...this._getValidationMessages(error.children || []),
        ]);
    }
    async publishListing(listingId, user) {
        if (user.role !== role_1.Role.ADMIN) {
            throw new common_1.UnauthorizedException('Admin access required');
        }
        const listing = await this._listingModel
            .findById(listingId)
            .populate(REALTOR_EMAIL_POPULATE)
            .exec();
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found');
        }
        if (listing.listing_state !== listing_interface_1.ListingState.PENDING_APPROVAL) {
            throw new common_1.BadRequestException('Only pending listings can be published');
        }
        if (!listing.images || listing.images.length === 0) {
            throw new common_1.BadRequestException('Listing must have at least one image before publishing');
        }
        listing.publishedAt = new Date();
        listing.isPublished = true;
        listing.expiresAt = this.listingExpirationUtil.getExpirationDate(listing.publishedAt);
        listing.expiredNotified = false;
        listing.listing_state = listing_interface_1.ListingState.PUBLISHED;
        listing.rejectionReasons = [];
        listing.approvalNotes = null;
        const updated = await listing.save();
        if (listing.realtor?.user?.email) {
            try {
                await this.emailService.sendListingApprovedEmail(listing.realtor.user.email, listing.title || 'Your Property Listing', listing.id.toString());
            }
            catch (err) {
                this.logger.error(`Failed to send approved email for listing ${listing.id}`, err);
            }
        }
        return (0, class_transformer_1.plainToInstance)(listing_response_dto_1.ListingResponseDto, updated, {
            excludeExtraneousValues: true,
        });
    }
    async findPendingListings(user) {
        if (user.role !== role_1.Role.ADMIN) {
            throw new common_1.UnauthorizedException('Admin access required');
        }
        const listings = await this._listingModel
            .find({ listing_state: listing_interface_1.ListingState.PENDING_APPROVAL })
            .populate({
            path: 'realtor',
            select: 'realtor_pic mobile_number whatsapp_number is_founding_realtor',
            populate: {
                path: 'user',
                model: 'User',
                select: 'full_name email',
            },
        })
            .sort({ createdAt: -1 })
            .exec();
        const plain = listings.map((l) => typeof l.toObject === 'function'
            ? l.toObject({ virtuals: true })
            : l);
        const mapped = (0, class_transformer_1.plainToInstance)(listing_response_dto_1.ListingResponseDto, plain, {
            excludeExtraneousValues: true,
        });
        return Array.isArray(mapped) ? mapped : mapped ? [mapped] : [];
    }
    async rejectListing(id, dto, user) {
        if (user.role !== role_1.Role.ADMIN) {
            throw new common_1.UnauthorizedException('Admin access required');
        }
        const listing = await this._listingModel
            .findById(id)
            .populate(REALTOR_EMAIL_POPULATE)
            .exec();
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found');
        }
        if (listing.listing_state !== listing_interface_1.ListingState.PENDING_APPROVAL) {
            throw new common_1.BadRequestException('Only pending listings can be rejected');
        }
        if (dto.reasons.length === 0) {
            throw new common_1.BadRequestException('At least one rejection reason is required');
        }
        listing.listing_state = listing_interface_1.ListingState.REJECTED;
        listing.isPublished = false;
        listing.publishedAt = null;
        listing.expiresAt = null;
        listing.rejectionReasons = dto.reasons;
        listing.approvalNotes = dto.note?.trim() || null;
        const updated = await listing.save();
        if (listing.realtor?.user?.email) {
            try {
                await this.emailService.sendListingRejectedEmail(listing.realtor.user.email, listing.title || 'Your Property Listing', dto.reasons.join(', ') || 'Review required');
            }
            catch (err) {
                this.logger.error(`Failed to send rejected email for listing ${listing.id}`, err);
            }
        }
        return (0, class_transformer_1.plainToInstance)(listing_response_dto_1.ListingResponseDto, updated, {
            excludeExtraneousValues: true,
        });
    }
    async findFeaturedListings(limit = 10) {
        const requestedLimit = Number(limit);
        const resultLimit = Number.isFinite(requestedLimit) && requestedLimit > 0
            ? Math.min(50, Math.trunc(requestedLimit))
            : 10;
        const filter = {
            listing_state: listing_interface_1.ListingState.PUBLISHED,
            isPublished: true,
            isFeatured: true,
            ...this._notExpiredFilter(),
        };
        const data = await this._listingModel
            .find(filter)
            .limit(resultLimit)
            .sort({ createdAt: -1 })
            .populate({
            path: 'realtor',
            select: 'realtor_pic mobile_number whatsapp_number is_founding_realtor',
            populate: { path: 'user', model: 'User', select: 'full_name email' },
        })
            .select({ __v: 0, updatedAt: 0 })
            .exec();
        return {
            data: (0, class_transformer_1.plainToInstance)(listing_response_dto_1.ListingResponseDto, data, {
                excludeExtraneousValues: true,
            }),
            meta: {
                total: data.length,
                page: 1,
                limit: resultLimit,
                totalPages: data.length ? 1 : 0,
                search: null,
            },
        };
    }
    async setFeaturedListings(listingIds) {
        if (!listingIds?.length) {
            throw new common_1.BadRequestException('At least one listing ID is required');
        }
        for (const id of listingIds) {
            if (!(0, mongoose_2.isValidObjectId)(id)) {
                throw new common_1.BadRequestException(`Invalid listing ID: ${id}`);
            }
        }
        const listings = await this._listingModel.find({
            _id: { $in: listingIds.map((id) => new mongoose_2.Types.ObjectId(id)) },
            listing_state: listing_interface_1.ListingState.PUBLISHED,
            isPublished: true,
            ...this._notExpiredFilter(),
        });
        if (listings.length !== listingIds.length) {
            const foundIds = listings.map((l) => l.id.toString());
            const missing = listingIds.filter((id) => !foundIds.includes(id));
            throw new common_1.BadRequestException(`Listings not found or not published: ${missing.join(', ')}`);
        }
        await this._listingModel.updateMany({ isFeatured: true }, { $set: { isFeatured: false } });
        await this._listingModel.updateMany({ _id: { $in: listingIds.map((id) => new mongoose_2.Types.ObjectId(id)) } }, { $set: { isFeatured: true } });
        const updated = await this._listingModel
            .find({ isFeatured: true })
            .populate({
            path: 'realtor',
            select: 'realtor_pic mobile_number whatsapp_number is_founding_realtor',
            populate: { path: 'user', model: 'User', select: 'full_name email' },
        })
            .select({ __v: 0, updatedAt: 0 })
            .exec();
        return {
            data: (0, class_transformer_1.plainToInstance)(listing_response_dto_1.ListingResponseDto, updated, {
                excludeExtraneousValues: true,
            }),
            meta: { total: updated.length },
        };
    }
    async findPublicListings(queryObj) {
        const filter = queryObj
            ? this._createFindFilter(queryObj, true)
            : {
                listing_state: listing_interface_1.ListingState.PUBLISHED,
                isPublished: true,
                ...this._notExpiredFilter(),
            };
        const page = Math.max(1, Number(queryObj?.page) || 1);
        const limit = Math.min(50, Number(queryObj?.limit) || 12);
        const skip = (page - 1) * limit;
        const queryBuilder = this._listingModel
            .find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate({
            path: 'realtor',
            select: 'realtor_pic mobile_number whatsapp_number is_founding_realtor',
            populate: { path: 'user', model: 'User', select: 'full_name email' },
        })
            .select({ __v: 0, updatedAt: 0 });
        if (queryObj?.latitude && queryObj?.longitude) {
            queryBuilder.sort({ location: 1 });
        }
        else {
            queryBuilder.sort({ createdAt: -1 });
        }
        const [data, total] = await Promise.all([
            queryBuilder.exec(),
            this._listingModel.countDocuments(filter),
        ]);
        return {
            data: (0, class_transformer_1.plainToInstance)(listing_response_dto_1.ListingResponseDto, data, {
                excludeExtraneousValues: true,
            }),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                search: queryObj?.search ?? queryObj?.location ?? null,
            },
        };
    }
    async findPublicListingById(id) {
        const listing = await this._listingModel
            .findOne({
            ...this._getListingIdentifierFilter(id),
            listing_state: listing_interface_1.ListingState.PUBLISHED,
            isPublished: true,
            ...this._notExpiredFilter(),
        })
            .populate({
            path: 'realtor',
            select: 'realtor_pic mobile_number whatsapp_number is_founding_realtor',
            populate: { path: 'user', model: 'User', select: 'full_name email' },
        })
            .select({ __v: 0, updatedAt: 0 })
            .exec();
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found or expired');
        }
        return (0, class_transformer_1.plainToInstance)(listing_response_dto_1.ListingResponseDto, listing, {
            excludeExtraneousValues: true,
        });
    }
    async contactRealtor(listing, dto) {
        if (!listing.realtor || !listing.realtor.user) {
            throw new common_1.BadRequestException('Invalid listing data');
        }
        const realtor = listing.realtor;
        console.log(`New contact request for listing ${listing.id}`);
        console.log(`From: ${dto.full_name} <${dto.email}>`);
        console.log(`Message: ${dto.message}`);
        console.log(`Realtor: ${realtor.user.full_name} <${realtor.user.email}>`);
        return {
            success: true,
            message: 'Message sent to realtor',
            realtor: {
                name: realtor.user.full_name,
                email: realtor.user.email,
                mobile_number: realtor.mobile_number,
                whatsapp_number: realtor.whatsapp_number,
            },
        };
    }
    async createContactLog(id, dto, userId) {
        const listing = await this._listingModel
            .findOne({
            ...this._getListingIdentifierFilter(id),
            listing_state: listing_interface_1.ListingState.PUBLISHED,
            isPublished: true,
            ...this._notExpiredFilter(),
        })
            .exec();
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found or expired');
        }
        const log = new this.contactLogModel({
            listingId: listing._id,
            realtorId: listing.realtor,
            contactType: dto.contactType,
            ...(userId && mongoose_2.Types.ObjectId.isValid(userId)
                ? { user: new mongoose_2.Types.ObjectId(userId) }
                : {}),
        });
        return log.save();
    }
    async findListings(realtorId, options) {
        if (!realtorId) {
            throw new common_1.BadRequestException('Realtor ID is missing');
        }
        let realtorObjectId;
        try {
            realtorObjectId = new mongoose_2.Types.ObjectId(realtorId);
        }
        catch (e) {
            console.log('✖ ObjectId creation failed:', e.message);
            throw new common_1.BadRequestException(`Invalid realtor ID format: ${realtorId}`);
        }
        const page = Math.max(1, Number(options?.page) || 1);
        const limit = Math.min(50, Number(options?.limit) || 12);
        const skip = (page - 1) * limit;
        const filter = { realtor: realtorObjectId };
        if (options?.search) {
            const regex = new RegExp(options.search, 'i');
            filter.$or = [
                { title: regex },
                { property_type: regex },
                { 'location.city': regex },
                { 'location.state': regex },
            ];
        }
        if (options?.status) {
            filter.status = options.status;
        }
        if (options?.listing_state) {
            filter.listing_state = options.listing_state;
        }
        const [listings, total] = await Promise.all([
            this._listingModel
                .find(filter)
                .populate({
                path: 'realtor',
                select: 'realtor_pic is_founding_realtor',
                populate: {
                    path: 'user',
                    model: 'User',
                    select: 'full_name',
                },
            })
                .select({ __v: 0, updatedAt: 0 })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this._listingModel.countDocuments(filter),
        ]);
        const withVirtuals = listings.map((listing) => listing.toObject({ virtuals: true }));
        return {
            data: (0, class_transformer_1.plainToInstance)(listing_response_dto_1.ListingResponseDto, withVirtuals, {
                excludeExtraneousValues: false,
                strategy: 'exposeAll',
                enableCircularCheck: true,
            }),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                search: options?.search ?? null,
            },
        };
    }
    async findListingForEdit(listingId, realtorId) {
        if (!mongoose_2.Types.ObjectId.isValid(listingId)) {
            throw new common_1.BadRequestException('Invalid listing _id');
        }
        if (!mongoose_2.Types.ObjectId.isValid(realtorId)) {
            throw new common_1.BadRequestException('Invalid realtor _id');
        }
        const listing = await this._listingModel
            .findOne({
            _id: new mongoose_2.Types.ObjectId(listingId),
            realtor: new mongoose_2.Types.ObjectId(realtorId),
        })
            .populate({
            path: 'realtor',
            select: 'realtor_pic is_founding_realtor',
            populate: {
                path: 'user',
                model: 'User',
                select: 'full_name',
            },
        })
            .select({ __v: 0, updatedAt: 0 })
            .exec();
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found or not owned by you');
        }
        return (0, class_transformer_1.plainToInstance)(listing_response_dto_1.ListingResponseDto, listing, {
            excludeExtraneousValues: false,
            strategy: 'exposeAll',
            enableCircularCheck: true,
        });
    }
    async findListingById(id, options) {
        const raw = options?.raw ?? false;
        const listing = await this._listingModel
            .findOne(this._getListingIdentifierFilter(id))
            .populate({
            path: 'realtor',
            select: 'realtor_pic mobile_number whatsapp_number user is_founding_realtor',
            populate: {
                path: 'user',
                model: 'User',
                select: 'full_name email',
            },
        })
            .select({ __v: 0, updatedAt: 0 })
            .exec();
        if (!listing)
            throw new common_1.NotFoundException('Listing not found');
        if (raw)
            return listing;
        return (0, class_transformer_1.plainToInstance)(listing_response_dto_1.ListingResponseDto, listing, {
            excludeExtraneousValues: true,
        });
    }
    async updateListing(listingId, realtorId, updateData) {
        if (!mongoose_2.Types.ObjectId.isValid(listingId)) {
            throw new common_1.BadRequestException('Invalid listing _id');
        }
        if (!mongoose_2.Types.ObjectId.isValid(realtorId)) {
            throw new common_1.BadRequestException('Invalid realtor _id');
        }
        const updateDto = (0, class_transformer_1.plainToInstance)(update_listing_dto_1.UpdateListingDto, updateData);
        const validationErrors = await (0, class_validator_1.validate)(updateDto, {
            whitelist: true,
            forbidNonWhitelisted: true,
        });
        if (validationErrors.length) {
            throw new common_1.BadRequestException(this._getValidationMessages(validationErrors));
        }
        const realtorObjectId = new mongoose_2.Types.ObjectId(realtorId);
        const filter = {
            _id: new mongoose_2.Types.ObjectId(listingId),
            realtor: realtorObjectId,
        };
        const listingUpdates = { ...updateDto };
        delete listingUpdates.cover_index;
        delete listingUpdates.realtor;
        if (typeof listingUpdates.title === 'string') {
            listingUpdates.title = this._titleCase(listingUpdates.title);
        }
        if (updateDto.details) {
            listingUpdates.details = this._normalizeDetails(updateDto.details);
        }
        const updateOptions = { new: true, runValidators: true };
        if ('property_category' in listingUpdates ||
            'property_type' in listingUpdates) {
            const listing = await this._listingModel.findOne(filter);
            if (!listing) {
                throw new common_1.NotFoundException('Listing not found or not owned by you');
            }
            const reapprovalFields = listing.isPublished || listing.listing_state === listing_interface_1.ListingState.REJECTED
                ? {
                    isPublished: false,
                    publishedAt: null,
                    expiresAt: null,
                    listing_state: listing_interface_1.ListingState.PENDING_APPROVAL,
                    rejectionReasons: [],
                    approvalNotes: null,
                }
                : {};
            Object.assign(listing, { ...reapprovalFields, ...listingUpdates });
            const saved = await listing.save();
            return (0, class_transformer_1.plainToInstance)(listing_response_dto_1.ListingResponseDto, saved, {
                excludeExtraneousValues: true,
            });
        }
        const saved = (await this._listingModel.findOneAndUpdate({
            ...filter,
            isPublished: { $ne: true },
            listing_state: { $ne: listing_interface_1.ListingState.REJECTED },
        }, { $set: listingUpdates }, updateOptions)) ??
            (await this._listingModel.findOneAndUpdate({
                ...filter,
                $or: [
                    { isPublished: true },
                    { listing_state: listing_interface_1.ListingState.REJECTED },
                ],
            }, {
                $set: {
                    isPublished: false,
                    publishedAt: null,
                    expiresAt: null,
                    listing_state: listing_interface_1.ListingState.PENDING_APPROVAL,
                    rejectionReasons: [],
                    approvalNotes: null,
                    ...listingUpdates,
                },
            }, updateOptions));
        if (!saved) {
            throw new common_1.NotFoundException('Listing not found or not owned by you');
        }
        return (0, class_transformer_1.plainToInstance)(listing_response_dto_1.ListingResponseDto, saved, {
            excludeExtraneousValues: true,
        });
    }
    async deleteListing(id, realtorId) {
        if (!mongoose_2.Types.ObjectId.isValid(id) || !mongoose_2.Types.ObjectId.isValid(realtorId)) {
            throw new common_1.BadRequestException('Invalid ID');
        }
        const listing = await this._listingModel.findOne({
            _id: new mongoose_2.Types.ObjectId(id),
            realtor: new mongoose_2.Types.ObjectId(realtorId),
        });
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found or you do not own it');
        }
        const imagePublicIds = [
            ...new Set([
                ...(listing.images ?? []).map((image) => image.publicId || getCloudinaryPublicId(image.url)),
                getCloudinaryPublicId(listing.cover_image),
            ].filter((publicId) => Boolean(publicId))),
        ];
        const cleanupResults = await Promise.allSettled(imagePublicIds.map((publicId) => this._cloudinaryService.deleteImage(publicId)));
        const failedCleanups = cleanupResults.flatMap((result, index) => {
            if (result.status === 'fulfilled') {
                return [];
            }
            this.logger.error(`Failed to delete Cloudinary image ${imagePublicIds[index]} for listing ${id}`, result.reason instanceof Error
                ? result.reason.stack
                : String(result.reason));
            return [imagePublicIds[index]];
        });
        if (failedCleanups.length) {
            throw new common_1.InternalServerErrorException('Could not delete all listing images from Cloudinary; the listing record was retained');
        }
        await this._listingModel.deleteOne({ _id: listing._id });
        return (0, class_transformer_1.plainToInstance)(listing_response_dto_1.ListingResponseDto, listing, {
            excludeExtraneousValues: true,
        });
    }
    async renewListing({ listingId, userId, }) {
        const foundListing = await this._listingModel
            .findById(listingId)
            .populate('realtor');
        if (!foundListing) {
            throw new common_1.NotFoundException('Listing not found');
        }
        if (foundListing.realtor.user.toString() != userId) {
            throw new common_1.UnauthorizedException('You do not own this listing');
        }
        const canBeRenewed = [
            listing_interface_1.ListingState.PUBLISHED,
            listing_interface_1.ListingState.EXPIRED,
        ].includes(foundListing.listing_state);
        const isExpired = (0, listingExpiration_util_1.isListingExpired)(foundListing.publishedAt, new Date(), foundListing.expiresAt);
        if (!canBeRenewed || !isExpired) {
            throw new common_1.BadRequestException(!canBeRenewed
                ? 'Only expired listings can be renewed'
                : 'This listing has not expired yet');
        }
        foundListing.expiresAt = null;
        foundListing.publishedAt = null;
        foundListing.listing_state = listing_interface_1.ListingState.PENDING_APPROVAL;
        foundListing.isPublished = false;
        foundListing.rejectionReasons = [];
        foundListing.approvalNotes = null;
        const saved = await foundListing.save();
        return (0, class_transformer_1.plainToInstance)(listing_response_dto_1.ListingResponseDto, saved, {
            excludeExtraneousValues: true,
        });
    }
    async createReport(dto) {
        const listingIdString = dto.listing;
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(listingIdString);
        const listing = await this._listingModel
            .findOne(isObjectId
            ? { _id: listingIdString }
            : { property_id: listingIdString })
            .populate(REALTOR_EMAIL_POPULATE)
            .lean();
        if (!listing) {
            throw new common_1.BadRequestException('Listing does not exist');
        }
        if (listing.listing_state === listing_interface_1.ListingState.PUBLISHED &&
            (0, listingExpiration_util_1.isListingExpired)(listing.publishedAt, new Date(), listing.expiresAt)) {
            throw new common_1.BadRequestException('Cannot report expired listings');
        }
        const report = await this._reportService.create({
            ...dto,
            listing: listing._id.toString(),
        });
        if (listing.realtor?.user?.email) {
            try {
                await this.emailService.sendNewReportEmail(listing.realtor.user.email, listing.title || 'Untitled Listing', dto.reason, dto.fullName || 'Anonymous');
            }
            catch (err) {
                this.logger.error(`Failed to send report email to realtor for listing ${listing.id}`, err);
            }
        }
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@kaban.ng';
        try {
            await this.emailService.sendNewReportAdminEmail(adminEmail, listing.title || 'Untitled Listing', dto.reason);
        }
        catch (err) {
            this.logger.error(`Failed to send admin report notification for listing ${listing.id}`, err);
        }
        return report;
    }
    async getListingReports(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid listing ID format');
        }
        const listingId = new mongoose_2.Types.ObjectId(id);
        const listing = await this._listingModel.findById(listingId).lean();
        if (!listing) {
            throw new common_1.NotFoundException('Listing does not exist');
        }
        return await this._reportService.findMany({
            listing: listingId.toString(),
        });
    }
    _createFindFilter(queryObj, enforceExpiration) {
        const filter = {};
        if (queryObj.latitude != null && queryObj.longitude != null) {
            const radiusKm = Number(queryObj.radius) || 10;
            const radiusRadians = radiusKm / 6371;
            filter['location.coordinates'] = {
                $geoWithin: {
                    $centerSphere: [
                        [Number(queryObj.longitude), Number(queryObj.latitude)],
                        radiusRadians,
                    ],
                },
            };
        }
        const locationSearch = queryObj.location ?? queryObj.search;
        if (locationSearch?.trim()) {
            const locationRegex = new RegExp(locationSearch.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$and = [
                ...(filter.$and ?? []),
                {
                    $or: [
                        { 'location.address': locationRegex },
                        { 'location.city': locationRegex },
                        { 'location.state': locationRegex },
                        { 'location.landmark': locationRegex },
                    ],
                },
            ];
        }
        if (queryObj.realtor) {
            if (!mongoose_2.Types.ObjectId.isValid(queryObj.realtor)) {
                throw new common_1.BadRequestException('Invalid realtor ID');
            }
            filter.realtor = new mongoose_2.Types.ObjectId(queryObj.realtor);
        }
        if (queryObj.property_type)
            filter.property_type = queryObj.property_type;
        const propertyCategory = queryObj.property_category ?? queryObj.category;
        if (propertyCategory)
            filter.property_category = propertyCategory;
        if (queryObj.status)
            filter.status = queryObj.status;
        if (queryObj.street_view !== undefined) {
            const raw = String(queryObj.street_view).trim().toLowerCase();
            filter.street_view =
                raw === 'true' || raw === '1' || raw === 'yes' || raw === 'on';
        }
        const bedroom = queryObj.bedroom ??
            queryObj['details.bedroom'] ??
            queryObj.details?.bedroom;
        if (bedroom !== undefined &&
            bedroom !== null &&
            String(bedroom).trim() !== '') {
            const bedroomCount = Number(bedroom);
            if (!Number.isFinite(bedroomCount) || bedroomCount < 0) {
                throw new common_1.BadRequestException('Bedroom filter must be a non-negative number');
            }
            filter['details.bedroom'] = bedroomCount;
        }
        const toiletCount = queryObj.toilet ??
            queryObj.toilets ??
            queryObj['details.toilet'] ??
            queryObj['details.bathroom'] ??
            queryObj.details?.toilet ??
            queryObj.details?.bathroom;
        if (toiletCount !== undefined &&
            toiletCount !== null &&
            String(toiletCount).trim() !== '') {
            const minimumToilets = Number(toiletCount);
            if (!Number.isFinite(minimumToilets) || minimumToilets < 0) {
                throw new common_1.BadRequestException('Toilet filter must be a non-negative number');
            }
            filter.$and = [
                ...(filter.$and ?? []),
                {
                    $or: [
                        { 'details.toilet': { $gte: minimumToilets } },
                        { 'details.bathroom': { $gte: minimumToilets } },
                    ],
                },
            ];
        }
        const minPrice = queryObj.min_price;
        const maxPrice = queryObj.max_price;
        if (minPrice !== undefined &&
            minPrice !== null &&
            String(minPrice).trim() !== '') {
            const amount = Number(minPrice);
            if (!Number.isFinite(amount) || amount < 0) {
                throw new common_1.BadRequestException('Minimum price must be a non-negative number');
            }
            filter['price.amount'] = { ...(filter['price.amount'] ?? {}), $gte: amount };
        }
        if (maxPrice !== undefined &&
            maxPrice !== null &&
            String(maxPrice).trim() !== '') {
            const amount = Number(maxPrice);
            if (!Number.isFinite(amount) || amount < 0) {
                throw new common_1.BadRequestException('Maximum price must be a non-negative number');
            }
            filter['price.amount'] = { ...(filter['price.amount'] ?? {}), $lte: amount };
        }
        const minAmount = filter['price.amount']?.$gte;
        const maxAmount = filter['price.amount']?.$lte;
        if (minAmount !== undefined &&
            maxAmount !== undefined &&
            minAmount > maxAmount) {
            throw new common_1.BadRequestException('Minimum price cannot be greater than maximum price');
        }
        const requestedFeatures = queryObj.features ?? queryObj.amenities;
        if (requestedFeatures) {
            const featuresArray = (Array.isArray(requestedFeatures)
                ? requestedFeatures
                : requestedFeatures.split(','))
                .map((feature) => feature.trim())
                .filter((feature) => feature.length > 0);
            if (featuresArray.length > 0) {
                filter['details.features'] = { $all: featuresArray };
            }
        }
        if (enforceExpiration) {
            filter.isPublished = true;
            Object.assign(filter, this._notExpiredFilter());
            filter.listing_state = listing_interface_1.ListingState.PUBLISHED;
        }
        return filter;
    }
    _normalizeDetails(details) {
        if (!details)
            return details;
        const count = details.toilet ?? details.bathroom;
        return count === undefined
            ? details
            : { ...details, toilet: count, bathroom: count };
    }
    _notExpiredFilter(now = new Date()) {
        return {
            $expr: {
                $gt: [
                    {
                        $ifNull: [
                            {
                                $add: [
                                    '$publishedAt',
                                    this.listingExpirationUtil.getExpirationDurationMs(),
                                ],
                            },
                            '$expiresAt',
                        ],
                    },
                    now,
                ],
            },
        };
    }
    _getListingIdentifierFilter(id) {
        if (/^[0-9a-fA-F]{24}$/.test(id)) {
            return { _id: id };
        }
        const slugPropertyId = id.match(/-((?:KID-)[a-zA-Z0-9-]+)$/)?.[1];
        return { property_id: slugPropertyId ?? id };
    }
    _titleCase(title) {
        return title
            .trim()
            .toLowerCase()
            .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
    }
    async addImagesToListing({ listingId, realtorId, files, }) {
        const saved = await this._addImagesToListing({
            listingId,
            realtorId,
            files,
        });
        return (0, class_transformer_1.plainToInstance)(listing_response_dto_1.ListingResponseDto, saved, {
            excludeExtraneousValues: true,
        });
    }
    async _addImagesToListing({ listingId, realtorId, files, }) {
        const listing = await this._listingModel
            .findById(listingId)
            .populate('realtor')
            .exec();
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found');
        }
        if (listing.realtor._id.toString() !== realtorId) {
            throw new common_1.UnauthorizedException('You do not own this listing');
        }
        if (listing.isPublished) {
            throw new common_1.UnauthorizedException('Cannot modify a published listing');
        }
        const folder = `kaban/listings/${listingId}`;
        const uploadedImages = await this._cloudinaryService.uploadImages(files, {
            folder,
        });
        listing.images.push(...uploadedImages);
        try {
            return await listing.save();
        }
        catch (error) {
            const cleanupResults = await Promise.allSettled(uploadedImages.map((image) => this._cloudinaryService.deleteImage(image.publicId)));
            cleanupResults.forEach((result) => {
                if (result.status === 'rejected') {
                    this.logger.error(`Failed to clean up Cloudinary image for listing ${listingId}`, result.reason instanceof Error
                        ? result.reason.stack
                        : String(result.reason));
                }
            });
            throw error;
        }
    }
};
exports.ListingService = ListingService;
exports.ListingService = ListingService = ListingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(listing_schema_1.Listing.name)),
    __param(1, (0, mongoose_1.InjectModel)(contact_log_schema_1.ContactLog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        report_service_1.ReportService,
        cloudinary_service_1.CloudinaryService,
        listingExpiration_util_1.ListingExpirationUtil,
        email_service_1.EmailService])
], ListingService);
//# sourceMappingURL=listing.service.js.map