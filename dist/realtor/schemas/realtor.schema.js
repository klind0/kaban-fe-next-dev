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
exports.RealtorSchema = exports.Realtor = exports.VERIFICATION_STATUS = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../../user/schemas/user.schema");
const kyc_schema_1 = require("./kyc.schema");
var VERIFICATION_STATUS;
(function (VERIFICATION_STATUS) {
    VERIFICATION_STATUS["NOT_VERIFIED"] = "NOT_VERIFIED";
    VERIFICATION_STATUS["PENDING"] = "PENDING";
    VERIFICATION_STATUS["VERIFIED"] = "VERIFIED";
})(VERIFICATION_STATUS || (exports.VERIFICATION_STATUS = VERIFICATION_STATUS = {}));
let Realtor = class Realtor {
    user;
    realtor_pic;
    is_founding_realtor;
    bio;
    company;
    office_address;
    service_area;
    mobile_number;
    whatsapp_number;
    socials;
    kyc;
    rating;
    verification_status;
};
exports.Realtor = Realtor;
__decorate([
    (0, mongoose_1.Prop)({ required: true, ref: 'User', type: mongoose_2.Types.ObjectId, unique: true }),
    __metadata("design:type", user_schema_1.User)
], Realtor.prototype, "user", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], Realtor.prototype, "realtor_pic", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, index: true }),
    __metadata("design:type", Boolean)
], Realtor.prototype, "is_founding_realtor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], Realtor.prototype, "bio", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], Realtor.prototype, "company", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], Realtor.prototype, "office_address", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], Realtor.prototype, "service_area", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], Realtor.prototype, "mobile_number", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], Realtor.prototype, "whatsapp_number", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Map, of: String, default: {} }),
    __metadata("design:type", Map)
], Realtor.prototype, "socials", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: kyc_schema_1.KYCSchema, default: {} }),
    __metadata("design:type", kyc_schema_1.KYC)
], Realtor.prototype, "kyc", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Realtor.prototype, "rating", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: Object.values(VERIFICATION_STATUS),
        default: VERIFICATION_STATUS.NOT_VERIFIED,
        index: true,
    }),
    __metadata("design:type", String)
], Realtor.prototype, "verification_status", void 0);
exports.Realtor = Realtor = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        toJSON: {
            getters: true,
            virtuals: true,
            transform: (doc, ret) => {
                ret.id = ret._id.toHexString();
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
        toObject: { virtuals: true, getters: true },
    })
], Realtor);
exports.RealtorSchema = mongoose_1.SchemaFactory.createForClass(Realtor);
exports.RealtorSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
//# sourceMappingURL=realtor.schema.js.map