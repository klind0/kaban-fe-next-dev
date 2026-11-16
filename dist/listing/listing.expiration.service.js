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
var ListingExpirationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingExpirationService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const listing_schema_1 = require("./schemas/listing.schema");
const email_service_1 = require("../email/email.service");
const listing_interface_1 = require("./listing.interface");
const listingExpiration_util_1 = require("../utils/listingExpiration.util");
let ListingExpirationService = ListingExpirationService_1 = class ListingExpirationService {
    listingModel;
    emailService;
    listingExpirationUtil;
    logger = new common_1.Logger(ListingExpirationService_1.name);
    constructor(listingModel, emailService, listingExpirationUtil) {
        this.listingModel = listingModel;
        this.emailService = emailService;
        this.listingExpirationUtil = listingExpirationUtil;
    }
    async processExpiredListings() {
        this.logger.log('Starting daily expired listings check...');
        const now = new Date();
        const expiredListings = await this.listingModel
            .find({
            listing_state: {
                $in: [listing_interface_1.ListingState.PUBLISHED, listing_interface_1.ListingState.EXPIRED],
            },
            $expr: {
                $lte: [
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
            $or: [
                { expiredNotified: false },
                { expiredNotified: { $exists: false } },
            ],
        })
            .populate({
            path: 'realtor',
            select: 'user',
            populate: {
                path: 'user',
                select: 'email full_name',
            },
        })
            .exec();
        if (!expiredListings.length) {
            this.logger.log('No expired listings found.');
            return;
        }
        this.logger.log(`Found ${expiredListings.length} expired listings to process.`);
        let successCount = 0;
        let failureCount = 0;
        for (const listing of expiredListings) {
            try {
                if (listing.listing_state !== listing_interface_1.ListingState.EXPIRED) {
                    listing.listing_state = listing_interface_1.ListingState.EXPIRED;
                    listing.isPublished = false;
                    listing.isFeatured = false;
                    await listing.save();
                }
                const email = listing.realtor?.user?.email;
                if (email) {
                    await this.emailService.sendListingExpiredEmail(email, listing.title || 'Your Property Listing', listing.id);
                    listing.expiredNotified = true;
                    await listing.save();
                    this.logger.log(`Expired notification sent to ${email} for listing ${listing.id}`);
                }
                else {
                    this.logger.warn(`No realtor email available for expired listing ${listing.id}`);
                }
                successCount++;
            }
            catch (err) {
                this.logger.error(`Failed to process expired listing ${listing.id}: ${err.message}`, err.stack);
                failureCount++;
            }
        }
        this.logger.log(`Expired listings check complete: ${successCount} succeeded, ${failureCount} failed.`);
    }
};
exports.ListingExpirationService = ListingExpirationService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ListingExpirationService.prototype, "processExpiredListings", null);
exports.ListingExpirationService = ListingExpirationService = ListingExpirationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(listing_schema_1.Listing.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        email_service_1.EmailService,
        listingExpiration_util_1.ListingExpirationUtil])
], ListingExpirationService);
//# sourceMappingURL=listing.expiration.service.js.map