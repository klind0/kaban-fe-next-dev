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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingResolver = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
const listing_service_1 = require("./listing.service");
const jwt_util_1 = require("../utils/jwt.util");
const role_1 = require("../user/role");
const listingExpiration_util_1 = require("../utils/listingExpiration.util");
const user_service_1 = require("../user/user.service");
const realtor_service_1 = require("../realtor/realtor.service");
const profile_completion_util_1 = require("../user/profile-completion.util");
let ListingResolver = class ListingResolver {
    _listingService;
    _jwtUtil;
    _configService;
    userService;
    realtorService;
    constructor(_listingService, _jwtUtil, _configService, userService, realtorService) {
        this._listingService = _listingService;
        this._jwtUtil = _jwtUtil;
        this._configService = _configService;
        this.userService = userService;
        this.realtorService = realtorService;
    }
    async publicListings(filter) {
        return this._listingService.findPublicListings(filter);
    }
    async publicListing(id) {
        return this._listingService.findPublicListingById(id);
    }
    async featuredListings(limit) {
        return this._listingService.findFeaturedListings(limit);
    }
    async myListings(context, page, limit, search, status, listing_state) {
        const user = await this._getUserFromContext(context);
        if (!user?.realtorId) {
            throw new common_1.BadRequestException('Realtor ID missing in token — please re-login');
        }
        return this._listingService.findListings(user.realtorId, {
            page,
            limit,
            search,
            status,
            listing_state,
        });
    }
    async getListingForEdit(id, context) {
        const user = await this._getUserFromContext(context);
        if (!user?.realtorId) {
            throw new common_1.BadRequestException('Realtor ID missing in token — please re-login');
        }
        return this._listingService.findListingForEdit(id, user.realtorId);
    }
    async createListing(input, submit, context) {
        const user = await this._getUserFromContext(context);
        if (!user?.realtorId) {
            throw new common_1.UnauthorizedException('Only realtors can create listings');
        }
        return this._listingService.createListing(input, user.realtorId, {
            submitImmediately: Boolean(submit),
        });
    }
    async submitListing(id, context) {
        const user = await this._getUserFromContext(context);
        if (!user?.realtorId) {
            throw new common_1.BadRequestException('Missing realtor _id for the logged-in user');
        }
        return this._listingService.submitListing(id, user.realtorId);
    }
    async updateListing(id, input, context) {
        const user = await this._getUserFromContext(context);
        return this._listingService.updateListing(id, user.realtorId, input);
    }
    async deleteListing(id, context) {
        const user = await this._getUserFromContext(context);
        if (!user?.realtorId) {
            throw new common_1.UnauthorizedException('Not a realtor');
        }
        return this._listingService.deleteListing(id, user.realtorId);
    }
    async renewListing(id, context) {
        const user = await this._getUserFromContext(context);
        return this._listingService.renewListing({
            listingId: id,
            userId: user.id,
        });
    }
    async reportListing(id, input) {
        return this._listingService.createReport({ ...input, listing: id });
    }
    async contactRealtor(id, input) {
        const listingDoc = await this._listingService.findListingById(id, {
            raw: true,
        });
        if (!listingDoc.isPublished ||
            (0, listingExpiration_util_1.isListingExpired)(listingDoc.publishedAt, new Date(), listingDoc.expiresAt)) {
            throw new common_1.NotFoundException('Listing not available');
        }
        return this._listingService.contactRealtor(listingDoc, input);
    }
    async publishListing(id, context) {
        const user = await this._getUserFromContext(context);
        this._assertAdmin(user);
        return this._listingService.publishListing(id, user);
    }
    async pendingListings(context) {
        const user = await this._getUserFromContext(context);
        this._assertAdmin(user);
        const data = await this._listingService.findPendingListings(user);
        return {
            data: Array.isArray(data) ? data : [],
            meta: { total: Array.isArray(data) ? data.length : 0 },
        };
    }
    async rejectListing(id, input, context) {
        const user = await this._getUserFromContext(context);
        this._assertAdmin(user);
        return this._listingService.rejectListing(id, input, user);
    }
    async setFeaturedListings(listingIds, context) {
        const user = await this._getUserFromContext(context);
        this._assertAdmin(user);
        return this._listingService.setFeaturedListings(listingIds);
    }
    async listingReports(id, context) {
        const user = await this._getUserFromContext(context);
        this._assertAdmin(user);
        return this._listingService.getListingReports(id);
    }
    async listingsByRealtor(id, page, limit, context) {
        const user = await this._getUserFromContext(context);
        this._assertAdmin(user);
        return this._listingService.findListings(id, { page, limit });
    }
    _assertAdmin(user) {
        if (user.role !== role_1.Role.ADMIN) {
            throw new common_1.UnauthorizedException('Admin access required');
        }
    }
    async _getUserFromContext(context) {
        const request = context?.req;
        const [type, token] = request?.headers?.authorization?.split(' ') ?? [];
        if (type !== 'Bearer' || !token) {
            throw new common_1.UnauthorizedException('Authentication token required');
        }
        let user;
        try {
            user = this._jwtUtil.verifyToken(token, this._configService.get('ACCESS_TOKEN_SECRET'));
        }
        catch (err) {
            if (err.name === 'TokenExpiredError') {
                throw new common_1.UnauthorizedException('Token has expired');
            }
            if (err.name === 'JsonWebTokenError') {
                throw new common_1.UnauthorizedException('Invalid token signature');
            }
            throw new common_1.UnauthorizedException('Authentication failed');
        }
        if (user.role === role_1.Role.ADMIN) {
            return user;
        }
        const profile = await this.userService.findProfileById(user.id);
        const realtor = user.realtorId &&
            (user.role === role_1.Role.AGENT || user.role === role_1.Role.AGENCY)
            ? await this.realtorService.findByUserId(user.id)
            : null;
        const missingFields = (0, profile_completion_util_1.getMissingProfileFields)(user.role, profile?.full_name, realtor?.mobile_number, realtor?.whatsapp_number);
        if (missingFields.length) {
            throw new common_1.ForbiddenException({
                code: 'PROFILE_INCOMPLETE',
                message: 'Complete your profile before accessing this resource.',
                missingFields,
            });
        }
        return user;
    }
};
exports.ListingResolver = ListingResolver;
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSONObject),
    __param(0, (0, graphql_1.Args)('filter', { type: () => graphql_type_json_1.GraphQLJSONObject, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ListingResolver.prototype, "publicListings", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSONObject),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ListingResolver.prototype, "publicListing", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSONObject),
    __param(0, (0, graphql_1.Args)('limit', { type: () => Number, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ListingResolver.prototype, "featuredListings", null);
__decorate([
    (0, throttler_1.SkipThrottle)({ short: true }),
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSONObject),
    __param(0, (0, graphql_1.Context)()),
    __param(1, (0, graphql_1.Args)('page', { type: () => Number, nullable: true })),
    __param(2, (0, graphql_1.Args)('limit', { type: () => Number, nullable: true })),
    __param(3, (0, graphql_1.Args)('search', { type: () => String, nullable: true })),
    __param(4, (0, graphql_1.Args)('status', { type: () => String, nullable: true })),
    __param(5, (0, graphql_1.Args)('listing_state', { type: () => String, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], ListingResolver.prototype, "myListings", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSONObject),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ListingResolver.prototype, "getListingForEdit", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject),
    __param(0, (0, graphql_1.Args)('input', { type: () => graphql_type_json_1.GraphQLJSONObject })),
    __param(1, (0, graphql_1.Args)('submit', { type: () => Boolean, nullable: true })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Boolean, Object]),
    __metadata("design:returntype", Promise)
], ListingResolver.prototype, "createListing", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ListingResolver.prototype, "submitListing", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __param(1, (0, graphql_1.Args)('input', { type: () => graphql_type_json_1.GraphQLJSONObject })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ListingResolver.prototype, "updateListing", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ListingResolver.prototype, "deleteListing", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ListingResolver.prototype, "renewListing", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __param(1, (0, graphql_1.Args)('input', { type: () => graphql_type_json_1.GraphQLJSONObject })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ListingResolver.prototype, "reportListing", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __param(1, (0, graphql_1.Args)('input', { type: () => graphql_type_json_1.GraphQLJSONObject })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ListingResolver.prototype, "contactRealtor", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ListingResolver.prototype, "publishListing", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSONObject),
    __param(0, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ListingResolver.prototype, "pendingListings", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __param(1, (0, graphql_1.Args)('input', { type: () => graphql_type_json_1.GraphQLJSONObject })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ListingResolver.prototype, "rejectListing", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject),
    __param(0, (0, graphql_1.Args)('listingIds', { type: () => [String] })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], ListingResolver.prototype, "setFeaturedListings", null);
__decorate([
    (0, graphql_1.Query)(() => [graphql_type_json_1.GraphQLJSONObject]),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ListingResolver.prototype, "listingReports", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSONObject),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __param(1, (0, graphql_1.Args)('page', { type: () => Number, nullable: true })),
    __param(2, (0, graphql_1.Args)('limit', { type: () => Number, nullable: true })),
    __param(3, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], ListingResolver.prototype, "listingsByRealtor", null);
exports.ListingResolver = ListingResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [listing_service_1.ListingService,
        jwt_util_1.JWTUtil,
        config_1.ConfigService,
        user_service_1.UserService,
        realtor_service_1.RealtorService])
], ListingResolver);
//# sourceMappingURL=listing.resolver.js.map