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
exports.CreateListingDto = exports.DetailInputDto = exports.LocationDto = exports.PriceDto = exports.ImageDto = exports.AMENITY_VALUES = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const graphql_upload_ts_1 = require("graphql-upload-ts");
const listing_interface_1 = require("../listing.interface");
exports.AMENITY_VALUES = [
    'swimming-pool',
    'fitted-kitchen',
    'in-built-speaker',
    'en-suite',
    'boys-quarter',
    'gym',
    'cctv-cameras',
    'security',
    'pre-paid-meter',
    'furnished',
    '24-hrs-electricity',
    'installed-wardrobe',
    'laundry-room',
    'elevator',
    'walk-in-closet',
    'family-room',
];
let ImageDto = class ImageDto {
    url;
    publicId;
};
exports.ImageDto = ImageDto;
__decorate([
    (0, graphql_1.Field)(),
    (0, swagger_1.ApiProperty)({
        example: 'https://res.cloudinary.com/example/image.jpg',
        description: 'Image URL',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImageDto.prototype, "url", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, swagger_1.ApiProperty)({
        example: 'kaban/listings/image123',
        description: 'Cloudinary public ID',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImageDto.prototype, "publicId", void 0);
exports.ImageDto = ImageDto = __decorate([
    (0, graphql_1.InputType)('ImageInput')
], ImageDto);
let PriceDto = class PriceDto {
    amount;
    per;
};
exports.PriceDto = PriceDto;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    (0, swagger_1.ApiProperty)({ example: 5000000, description: 'Price amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], PriceDto.prototype, "amount", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, swagger_1.ApiProperty)({
        example: 'month',
        description: 'Price period (e.g., month, year, one-time)',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PriceDto.prototype, "per", void 0);
exports.PriceDto = PriceDto = __decorate([
    (0, graphql_1.InputType)('PriceInput')
], PriceDto);
let LocationDto = class LocationDto {
    address;
    state;
    city;
    landmark;
    coordinates;
};
exports.LocationDto = LocationDto;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, swagger_1.ApiProperty)({
        example: '15 Admiralty Way, Lekki Phase 1',
        description: 'Property address',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LocationDto.prototype, "address", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, swagger_1.ApiProperty)({
        example: 'Lagos',
        description: 'State where property is located',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LocationDto.prototype, "state", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, swagger_1.ApiProperty)({
        example: 'Lekki',
        description: 'City where property is located',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LocationDto.prototype, "city", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, swagger_1.ApiProperty)({
        example: 'Near the Lekki Toll Gate',
        description: 'Nearby landmark',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LocationDto.prototype, "landmark", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_1.Float], { nullable: true }),
    (0, swagger_1.ApiProperty)({
        example: [3.3792, 6.5244],
        description: 'Coordinates as [longitude, latitude]',
        required: false,
        type: [Number],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], LocationDto.prototype, "coordinates", void 0);
exports.LocationDto = LocationDto = __decorate([
    (0, graphql_1.InputType)('LocationInput')
], LocationDto);
let DetailInputDto = class DetailInputDto {
    bedroom;
    toilet;
    bathroom;
    living_room;
    land_area;
    parking_space;
    features;
};
exports.DetailInputDto = DetailInputDto;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], DetailInputDto.prototype, "bedroom", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], DetailInputDto.prototype, "toilet", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], DetailInputDto.prototype, "bathroom", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], DetailInputDto.prototype, "living_room", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DetailInputDto.prototype, "land_area", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], DetailInputDto.prototype, "parking_space", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsIn)([...exports.AMENITY_VALUES], { each: true }),
    __metadata("design:type", Array)
], DetailInputDto.prototype, "features", void 0);
exports.DetailInputDto = DetailInputDto = __decorate([
    (0, graphql_1.InputType)('DetailInput')
], DetailInputDto);
let CreateListingDto = class CreateListingDto {
    property_id;
    title;
    description;
    property_category;
    property_type;
    status;
    price;
    location;
    cover_image;
    images;
    video;
    details;
    street_view;
};
exports.CreateListingDto = CreateListingDto;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, swagger_1.ApiProperty)({
        example: 'PROP-2024-001',
        description: 'Unique property identifier',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateListingDto.prototype, "property_id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, swagger_1.ApiProperty)({
        example: 'Luxury 3 Bedroom Apartment in Lekki',
        description: 'Property title',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateListingDto.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, swagger_1.ApiProperty)({
        example: 'Beautiful 3-bedroom apartment with modern amenities in a serene environment',
        description: 'Detailed property description',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateListingDto.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, swagger_1.ApiProperty)({
        enum: ['commercial', 'industrial', 'residential'],
        example: 'residential',
        description: 'Property category',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['commercial', 'industrial', 'residential']),
    __metadata("design:type", String)
], CreateListingDto.prototype, "property_category", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, swagger_1.ApiProperty)({
        example: 'apartment',
        description: 'Type of property',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateListingDto.prototype, "property_type", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, swagger_1.ApiProperty)({
        enum: listing_interface_1.Status,
        example: 'for-sale',
        description: 'Property status',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(listing_interface_1.Status),
    __metadata("design:type", String)
], CreateListingDto.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => PriceDto, { nullable: true }),
    (0, swagger_1.ApiProperty)({
        type: PriceDto,
        description: 'Property price information',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PriceDto),
    __metadata("design:type", PriceDto)
], CreateListingDto.prototype, "price", void 0);
__decorate([
    (0, graphql_1.Field)(() => LocationDto, { nullable: true }),
    (0, swagger_1.ApiProperty)({
        type: LocationDto,
        description: 'Property location (address, state, city, landmark, coordinates)',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LocationDto),
    __metadata("design:type", LocationDto)
], CreateListingDto.prototype, "location", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, swagger_1.ApiProperty)({
        example: 'https://res.cloudinary.com/example/cover.jpg',
        description: 'Cover image URL',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateListingDto.prototype, "cover_image", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_upload_ts_1.GraphQLUpload], { nullable: 'itemsAndList' }),
    (0, swagger_1.ApiProperty)({
        type: [ImageDto],
        description: 'Array of property images (Accepts ImageDto objects or GraphQLUpload stream promises)',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateListingDto.prototype, "images", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, swagger_1.ApiProperty)({
        example: 'https://youtube.com/watch?v=example',
        description: 'Property video URL',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateListingDto.prototype, "video", void 0);
__decorate([
    (0, graphql_1.Field)(() => DetailInputDto, { nullable: true }),
    (0, swagger_1.ApiProperty)({
        description: 'Additional property details (bedrooms, toilets, etc.)',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DetailInputDto),
    __metadata("design:type", DetailInputDto)
], CreateListingDto.prototype, "details", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Whether street view is available',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateListingDto.prototype, "street_view", void 0);
exports.CreateListingDto = CreateListingDto = __decorate([
    (0, graphql_1.InputType)()
], CreateListingDto);
//# sourceMappingURL=create-listing.dto.js.map