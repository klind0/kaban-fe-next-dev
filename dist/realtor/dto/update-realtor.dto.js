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
exports.UpdateRealtorDto = void 0;
const class_validator_1 = require("class-validator");
const kyc_schema_1 = require("../schemas/kyc.schema");
const realtor_schema_1 = require("../schemas/realtor.schema");
const class_transformer_1 = require("class-transformer");
class UpdateRealtorDto {
    full_name;
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
    verification_status;
}
exports.UpdateRealtorDto = UpdateRealtorDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRealtorDto.prototype, "full_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRealtorDto.prototype, "realtor_pic", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateRealtorDto.prototype, "is_founding_realtor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRealtorDto.prototype, "bio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRealtorDto.prototype, "company", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRealtorDto.prototype, "office_address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRealtorDto.prototype, "service_area", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[0-9+\-\s()]{10,15}$/, {
        message: 'Please enter a valid mobile number',
    }),
    __metadata("design:type", String)
], UpdateRealtorDto.prototype, "mobile_number", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[0-9+\-\s()]{10,15}$/, {
        message: 'Please enter a valid WhatsApp number',
    }),
    __metadata("design:type", String)
], UpdateRealtorDto.prototype, "whatsapp_number", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRealtorDto.prototype, "socials", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => kyc_schema_1.KYC),
    __metadata("design:type", Object)
], UpdateRealtorDto.prototype, "kyc", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(realtor_schema_1.VERIFICATION_STATUS),
    __metadata("design:type", String)
], UpdateRealtorDto.prototype, "verification_status", void 0);
//# sourceMappingURL=update-realtor.dto.js.map