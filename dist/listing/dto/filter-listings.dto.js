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
exports.FilterListingsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const listing_interface_1 = require("../listing.interface");
const ALL_PROPERTY_TYPES = [
    ...listing_interface_1.propertyCategory.commercial,
    ...listing_interface_1.propertyCategory.industrial,
    ...listing_interface_1.propertyCategory.residential,
];
class FilterListingsDto {
    search;
    page = 1;
    limit = 12;
    latitude;
    longitude;
    radius = 10;
    location;
    status;
    property_type;
    property_category;
    category;
    bedroom;
    toilet;
    toilets;
    bathroom;
    min_price;
    max_price;
    realtor;
    street_view;
    features;
    amenities;
}
exports.FilterListingsDto = FilterListingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Location or listing search term' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterListingsDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Page number (starts from 1)',
        example: 1,
        type: Number,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], FilterListingsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Items per page (max 50)',
        example: 12,
        type: Number,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], FilterListingsDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Latitude for geo search',
        example: 6.5244,
        type: Number,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FilterListingsDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Longitude for geo search',
        example: 3.3792,
        type: Number,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FilterListingsDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Search radius in km (default 10)',
        example: 10,
        type: Number,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(0.1),
    (0, class_validator_1.Max)(200),
    __metadata("design:type", Number)
], FilterListingsDto.prototype, "radius", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Location keyword search',
        example: 'Uyo',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterListingsDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: listing_interface_1.Status,
        description: 'Sale or rent',
        example: listing_interface_1.Status.sale,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(listing_interface_1.Status),
    __metadata("design:type", String)
], FilterListingsDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: ALL_PROPERTY_TYPES,
        description: 'Specific property type (valid options depend on category)',
        example: 'Apartment',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(ALL_PROPERTY_TYPES),
    __metadata("design:type", String)
], FilterListingsDto.prototype, "property_type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: Object.keys(listing_interface_1.propertyCategory),
        description: 'Property category',
        example: 'residential',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(Object.keys(listing_interface_1.propertyCategory)),
    __metadata("design:type", String)
], FilterListingsDto.prototype, "property_category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: Object.keys(listing_interface_1.propertyCategory),
        description: 'Alias for property_category used by the web client',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(Object.keys(listing_interface_1.propertyCategory)),
    __metadata("design:type", String)
], FilterListingsDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Exact number of bedrooms',
        example: 2,
        type: Number,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FilterListingsDto.prototype, "bedroom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Minimum number of toilets',
        example: 1,
        type: Number,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FilterListingsDto.prototype, "toilet", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Minimum number of toilets (legacy bathroom alias)',
        example: 1,
        type: Number,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FilterListingsDto.prototype, "toilets", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Minimum number of bathrooms (alias for toilets)',
        example: 1,
        type: Number,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FilterListingsDto.prototype, "bathroom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Minimum price',
        example: 10000000,
        type: Number,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FilterListingsDto.prototype, "min_price", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maximum price',
        example: 500000000,
        type: Number,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FilterListingsDto.prototype, "max_price", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by realtor ID (admin use)',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], FilterListingsDto.prototype, "realtor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Street view availability (true/false/yes/no)',
        example: 'true',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterListingsDto.prototype, "street_view", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Comma-separated features',
        example: 'pool,gym,balcony',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterListingsDto.prototype, "features", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Array of frontend amenity slugs or comma-separated values',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], FilterListingsDto.prototype, "amenities", void 0);
//# sourceMappingURL=filter-listings.dto.js.map