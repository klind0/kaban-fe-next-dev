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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingResponseDto = exports.LocationDto = exports.DetailDto = exports.ListingImageDto = exports.PriceDto = exports.RealtorInfoDto = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_transformer_1 = require("class-transformer");
const listing_interface_1 = require("../listing.interface");
const listingExpiration_util_1 = require("../../utils/listingExpiration.util");
let RealtorInfoDto = class RealtorInfoDto {
    full_name;
    email;
    mobile_number;
    whatsapp_number;
    realtor_pic;
    is_founding_realtor;
};
exports.RealtorInfoDto = RealtorInfoDto;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ obj }) => obj?.user?.full_name || obj?.full_name || ''),
    __metadata("design:type", String)
], RealtorInfoDto.prototype, "full_name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ obj }) => obj?.user?.email || obj?.email || ''),
    __metadata("design:type", String)
], RealtorInfoDto.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], RealtorInfoDto.prototype, "mobile_number", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], RealtorInfoDto.prototype, "whatsapp_number", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], RealtorInfoDto.prototype, "realtor_pic", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], RealtorInfoDto.prototype, "is_founding_realtor", void 0);
exports.RealtorInfoDto = RealtorInfoDto = __decorate([
    (0, graphql_1.ObjectType)()
], RealtorInfoDto);
let PriceDto = class PriceDto {
    amount;
    per;
};
exports.PriceDto = PriceDto;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], PriceDto.prototype, "amount", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], PriceDto.prototype, "per", void 0);
exports.PriceDto = PriceDto = __decorate([
    (0, graphql_1.ObjectType)('PriceResponse')
], PriceDto);
let ListingImageDto = class ListingImageDto {
    url;
};
exports.ListingImageDto = ListingImageDto;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ListingImageDto.prototype, "url", void 0);
exports.ListingImageDto = ListingImageDto = __decorate([
    (0, graphql_1.ObjectType)('ListingImageResponse')
], ListingImageDto);
let DetailDto = class DetailDto {
    bedroom;
    toilet;
    bathroom;
    living_room;
    land_area;
    parking_space;
    features;
};
exports.DetailDto = DetailDto;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], DetailDto.prototype, "bedroom", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], DetailDto.prototype, "toilet", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], DetailDto.prototype, "bathroom", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], DetailDto.prototype, "living_room", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], DetailDto.prototype, "land_area", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], DetailDto.prototype, "parking_space", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: 'itemsAndList' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Array)
], DetailDto.prototype, "features", void 0);
exports.DetailDto = DetailDto = __decorate([
    (0, graphql_1.ObjectType)('DetailResponse')
], DetailDto);
let LocationDto = class LocationDto {
    address;
    state;
    city;
    landmark;
    coordinates;
};
exports.LocationDto = LocationDto;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LocationDto.prototype, "address", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LocationDto.prototype, "state", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LocationDto.prototype, "city", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LocationDto.prototype, "landmark", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_1.Float]),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Array)
], LocationDto.prototype, "coordinates", void 0);
exports.LocationDto = LocationDto = __decorate([
    (0, graphql_1.ObjectType)()
], LocationDto);
let ListingResponseDto = class ListingResponseDto {
    id;
    title;
    property_id;
    description;
    property_category;
    property_type;
    status;
    price;
    details;
    images;
    cover_image;
    video;
    location;
    street_view;
    isFeatured;
    isPublished;
    createdAt;
    publishedAt;
    expiresAt;
    realtor;
    rejectionReasons;
    approvalNotes;
    listing_state;
    effectiveState;
};
exports.ListingResponseDto = ListingResponseDto;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ListingResponseDto.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ListingResponseDto.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ListingResponseDto.prototype, "property_id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ListingResponseDto.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ListingResponseDto.prototype, "property_category", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ListingResponseDto.prototype, "property_type", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ListingResponseDto.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => PriceDto),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => PriceDto),
    __metadata("design:type", PriceDto)
], ListingResponseDto.prototype, "price", void 0);
__decorate([
    (0, graphql_1.Field)(() => DetailDto),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => DetailDto),
    __metadata("design:type", DetailDto)
], ListingResponseDto.prototype, "details", void 0);
__decorate([
    (0, graphql_1.Field)(() => [ListingImageDto]),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => ListingImageDto),
    __metadata("design:type", Array)
], ListingResponseDto.prototype, "images", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ListingResponseDto.prototype, "cover_image", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ListingResponseDto.prototype, "video", void 0);
__decorate([
    (0, graphql_1.Field)(() => LocationDto),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => LocationDto),
    __metadata("design:type", LocationDto)
], ListingResponseDto.prototype, "location", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], ListingResponseDto.prototype, "street_view", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], ListingResponseDto.prototype, "isFeatured", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], ListingResponseDto.prototype, "isPublished", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ListingResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ListingResponseDto.prototype, "publishedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ obj }) => {
        const expiresAt = (0, listingExpiration_util_1.getListingExpirationDate)(obj?.publishedAt, obj?.expiresAt);
        return expiresAt?.toISOString() ?? null;
    }),
    __metadata("design:type", String)
], ListingResponseDto.prototype, "expiresAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => RealtorInfoDto),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => RealtorInfoDto),
    __metadata("design:type", RealtorInfoDto)
], ListingResponseDto.prototype, "realtor", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Array)
], ListingResponseDto.prototype, "rejectionReasons", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ListingResponseDto.prototype, "approvalNotes", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ListingResponseDto.prototype, "listing_state", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'effectiveState' }),
    __metadata("design:type", String)
], ListingResponseDto.prototype, "effectiveState", void 0);
exports.ListingResponseDto = ListingResponseDto = __decorate([
    (0, graphql_1.ObjectType)()
], ListingResponseDto);
//# sourceMappingURL=listing-response.dto.js.map