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
exports.ListingSchema = exports.Listing = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const realtor_schema_1 = require("../../realtor/schemas/realtor.schema");
const listing_interface_1 = require("../listing.interface");
const listingExpiration_util_1 = require("../../utils/listingExpiration.util");
let Listing = class Listing {
    id;
    realtor;
    property_id;
    title;
    description;
    property_category;
    property_type;
    status;
    price;
    images;
    cover_image;
    video;
    details;
    location;
    street_view;
    rejectionReasons;
    approvalNotes;
    isPublished;
    publishedAt;
    expiresAt;
    listing_state;
    expiredNotified;
    isFeatured;
};
exports.Listing = Listing;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Realtor' }),
    __metadata("design:type", realtor_schema_1.Realtor)
], Listing.prototype, "realtor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Listing.prototype, "property_id", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Listing.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Listing.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        trim: true,
        lowercase: true,
        validate: {
            validator(property_category) {
                return Object.keys(listing_interface_1.propertyCategory).includes(property_category);
            },
            message: 'Invalid property category',
        },
    }),
    __metadata("design:type", String)
], Listing.prototype, "property_category", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        validate: {
            validator(property_type) {
                return (listing_interface_1.propertyCategory[this.property_category]?.includes(property_type) || false);
            },
            message: 'Invalid property type',
        },
    }),
    __metadata("design:type", String)
], Listing.prototype, "property_type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: listing_interface_1.Status }),
    __metadata("design:type", String)
], Listing.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            amount: { type: Number },
            per: { type: String },
            _id: false,
        },
        default: {},
    }),
    __metadata("design:type", Object)
], Listing.prototype, "price", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{ url: { type: String }, publicId: { type: String } }],
        default: [],
    }),
    __metadata("design:type", Array)
], Listing.prototype, "images", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Listing.prototype, "cover_image", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Listing.prototype, "video", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            bedroom: { type: Number, required: false },
            toilet: { type: Number, required: false },
            bathroom: { type: Number, required: false },
            living_room: { type: Number, required: false },
            land_area: { type: String, required: false },
            parking_space: { type: Number, required: false },
            features: [String],
            _id: false,
        },
        default: {},
    }),
    __metadata("design:type", Object)
], Listing.prototype, "details", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            address: { type: String, trim: true, lowercase: true, required: false },
            state: { type: String, trim: true, lowercase: true, required: false },
            city: { type: String, trim: true, lowercase: true, required: false },
            landmark: { type: String, trim: true, required: false },
            coordinates: {
                type: [Number],
                required: false,
            },
            _id: false,
        },
        default: {},
    }),
    __metadata("design:type", Object)
], Listing.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Listing.prototype, "street_view", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [String],
        enum: [
            'description',
            'price',
            'details',
            'image',
            'location',
            'map',
            'duplicate',
            'tos_violation',
        ],
        default: [],
    }),
    __metadata("design:type", Array)
], Listing.prototype, "rejectionReasons", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Listing.prototype, "approvalNotes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Listing.prototype, "isPublished", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], Listing.prototype, "publishedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], Listing.prototype, "expiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: listing_interface_1.ListingState,
        default: listing_interface_1.ListingState.DRAFT,
    }),
    __metadata("design:type", String)
], Listing.prototype, "listing_state", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Listing.prototype, "expiredNotified", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Listing.prototype, "isFeatured", void 0);
exports.Listing = Listing = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        toJSON: { getters: true },
        toObject: { getters: true },
    })
], Listing);
const ListingSchema = mongoose_1.SchemaFactory.createForClass(Listing);
exports.ListingSchema = ListingSchema;
ListingSchema.virtual('effectiveState').get(function () {
    if (this.listing_state === listing_interface_1.ListingState.PUBLISHED) {
        if ((0, listingExpiration_util_1.isListingExpired)(this.publishedAt, new Date(), this.expiresAt)) {
            return listing_interface_1.ListingState.EXPIRED;
        }
        return listing_interface_1.ListingState.PUBLISHED;
    }
    return this.listing_state;
});
ListingSchema.set('toJSON', { virtuals: true, getters: true });
ListingSchema.set('toObject', { virtuals: true, getters: true });
ListingSchema.index({ 'location.coordinates': '2dsphere' }, {
    sparse: true,
    partialFilterExpression: {
        'location.coordinates': { $exists: true },
    },
});
ListingSchema.index({ listing_state: 1, isPublished: 1, expiresAt: -1 });
ListingSchema.index({ isFeatured: 1, listing_state: 1, expiresAt: -1 });
ListingSchema.index({ realtor: 1, createdAt: -1 });
ListingSchema.index({ publishedAt: -1 });
ListingSchema.index({ listing_state: 1, createdAt: -1 });
//# sourceMappingURL=listing.schema.js.map