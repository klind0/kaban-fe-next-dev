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
exports.ContactLogSchema = exports.ContactLog = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ContactLog = class ContactLog {
    listingId;
    realtorId;
    contactType;
    user;
};
exports.ContactLog = ContactLog;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Listing', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ContactLog.prototype, "listingId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Realtor', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ContactLog.prototype, "realtorId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, enum: ['call', 'whatsapp', 'email'] }),
    __metadata("design:type", String)
], ContactLog.prototype, "contactType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ContactLog.prototype, "user", void 0);
exports.ContactLog = ContactLog = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ContactLog);
exports.ContactLogSchema = mongoose_1.SchemaFactory.createForClass(ContactLog);
//# sourceMappingURL=contact-log.schema.js.map