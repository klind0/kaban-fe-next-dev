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
var RealtorController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtorController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../auth/auth.guard");
const realtor_service_1 = require("./realtor.service");
const create_realtor_dto_1 = require("./dto/create-realtor.dto");
const update_realtor_dto_1 = require("./dto/update-realtor.dto");
const set_founding_realtor_dto_1 = require("./dto/set-founding-realtor.dto");
const platform_express_1 = require("@nestjs/platform-express");
const realtor_schema_1 = require("./schemas/realtor.schema");
const role_1 = require("../user/role");
const success_interceptors_1 = require("../common/interceptors/success.interceptors");
const cloudinary_service_1 = require("../common/cloudinary/cloudinary.service");
let RealtorController = RealtorController_1 = class RealtorController {
    _realtorService;
    _cloudinaryService;
    logger = new common_1.Logger(RealtorController_1.name);
    constructor(_realtorService, _cloudinaryService) {
        this._realtorService = _realtorService;
        this._cloudinaryService = _cloudinaryService;
    }
    async createRealtor(createRealtorDto, req) {
        if (req.user.role !== role_1.Role.ADMIN &&
            req.user.id !== createRealtorDto.user.toString()) {
            throw new common_1.ForbiddenException('You can only create a realtor profile for your own account');
        }
        if (req.user?.id) {
            const existing = await this._realtorService.findRealtor({
                user: req.user.id,
            });
            if (existing) {
                throw new common_1.BadRequestException('You already have a realtor profile');
            }
        }
        return await this._realtorService.createRealtor(createRealtorDto);
    }
    async getRealtors(req) {
        if (req.user.role !== role_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Admin access required');
        }
        return await this._realtorService.findRealtors();
    }
    async getRealtor(realtorId, req) {
        const realtor = await this._realtorService.findRealtorById(realtorId);
        if (req.user.role !== role_1.Role.ADMIN && req.user.realtorId !== realtorId) {
            throw new common_1.ForbiddenException('You do not have permission to view this realtor');
        }
        return realtor;
    }
    async setFoundingRealtor(id, dto, req) {
        if (req.user.role !== role_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Admin access required');
        }
        if (dto.is_founding_realtor) {
            const realtor = await this._realtorService.findRealtorById(id);
            if (!realtor.is_founding_realtor) {
                const count = await this._realtorService.countFoundingRealtors();
                if (count >= 20) {
                    throw new common_1.BadRequestException('Maximum of 20 Founding Realtors reached');
                }
            }
        }
        return this._realtorService.updateRealtor(id, {
            is_founding_realtor: dto.is_founding_realtor,
        });
    }
    async updateRealtor(id, files = {}, updateRealtorDto, req) {
        if (updateRealtorDto.is_founding_realtor !== undefined) {
            throw new common_1.ForbiddenException('Use the admin founding-realtor endpoint to change this badge');
        }
        if (updateRealtorDto.verification_status !== undefined) {
            throw new common_1.ForbiddenException('Verification status can only be changed by an administrator');
        }
        if (req.user.realtorId !== id) {
            throw new common_1.ForbiddenException('You can only update your own realtor profile');
        }
        updateRealtorDto.kyc = updateRealtorDto.kyc ?? {};
        const filesToUpload = [];
        const fileKeys = [];
        if (files.realtor_pic?.[0]) {
            filesToUpload.push(files.realtor_pic[0]);
            fileKeys.push('realtor_pic');
        }
        if (files.government_id?.[0]) {
            filesToUpload.push(files.government_id[0]);
            fileKeys.push('government_id');
        }
        if (files.realtor_certification?.[0]) {
            filesToUpload.push(files.realtor_certification[0]);
            fileKeys.push('realtor_certification');
        }
        if (filesToUpload.length > 0) {
            const folder = `kaban/realtors/${id}`;
            const uploaded = await this._cloudinaryService.uploadImages(filesToUpload, {
                folder,
            });
            uploaded.forEach((img, index) => {
                const key = fileKeys[index];
                if (key === 'realtor_pic') {
                    updateRealtorDto.realtor_pic = img.url;
                }
                else if (key === 'government_id') {
                    updateRealtorDto.kyc.government_id = img.url;
                    updateRealtorDto.verification_status = realtor_schema_1.VERIFICATION_STATUS.PENDING;
                }
                else if (key === 'realtor_certification') {
                    updateRealtorDto.kyc.realtor_certification = img.url;
                    updateRealtorDto.verification_status = realtor_schema_1.VERIFICATION_STATUS.PENDING;
                }
            });
        }
        if (updateRealtorDto.socials && typeof updateRealtorDto.socials === 'string') {
            try {
                updateRealtorDto.socials = JSON.parse(updateRealtorDto.socials);
            }
            catch {
                throw new common_1.BadRequestException('Invalid socials JSON format');
            }
        }
        const clean = (v) => (v ? v.replace(/^"|"$/g, '').trim() : v);
        updateRealtorDto.full_name = clean(updateRealtorDto.full_name);
        updateRealtorDto.bio = clean(updateRealtorDto.bio);
        updateRealtorDto.company = clean(updateRealtorDto.company);
        updateRealtorDto.mobile_number = clean(updateRealtorDto.mobile_number);
        updateRealtorDto.whatsapp_number = clean(updateRealtorDto.whatsapp_number);
        const fullName = updateRealtorDto.full_name;
        delete updateRealtorDto.full_name;
        return this._realtorService.updateRealtor(id, updateRealtorDto, {
            userId: req.user.id,
            fullName,
        });
    }
    async deleteRealtor(realtorId, req) {
        this.logger.log(`Deleting realtor ${realtorId} by user ${req.user.id}`);
        if (req.user.realtorId !== realtorId) {
            throw new common_1.ForbiddenException('You can only delete your own realtor profile');
        }
        return await this._realtorService.deleteRealtor(realtorId);
    }
};
exports.RealtorController = RealtorController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_realtor_dto_1.CreateRealtorDto, Object]),
    __metadata("design:returntype", Promise)
], RealtorController.prototype, "createRealtor", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RealtorController.prototype, "getRealtors", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RealtorController.prototype, "getRealtor", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Put)('admin/:id/founding'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, set_founding_realtor_dto_1.SetFoundingRealtorDto, Object]),
    __metadata("design:returntype", Promise)
], RealtorController.prototype, "setFoundingRealtor", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Put)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'realtor_pic', maxCount: 1 },
        { name: 'government_id', maxCount: 1 },
        { name: 'realtor_certification', maxCount: 1 },
    ])),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_realtor_dto_1.UpdateRealtorDto, Object]),
    __metadata("design:returntype", Promise)
], RealtorController.prototype, "updateRealtor", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RealtorController.prototype, "deleteRealtor", null);
exports.RealtorController = RealtorController = RealtorController_1 = __decorate([
    (0, common_1.UseInterceptors)(success_interceptors_1.SuccessInterceptor),
    (0, common_1.Controller)('realtors'),
    __metadata("design:paramtypes", [realtor_service_1.RealtorService,
        cloudinary_service_1.CloudinaryService])
], RealtorController);
//# sourceMappingURL=realtor.controller.js.map