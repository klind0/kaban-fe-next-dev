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
var RealtorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtorService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const realtor_schema_1 = require("./schemas/realtor.schema");
const user_schema_1 = require("../user/schemas/user.schema");
const email_service_1 = require("../email/email.service");
const USER_POPULATE_DATA = 'email full_name phone_num role';
let RealtorService = RealtorService_1 = class RealtorService {
    _realtorModel;
    userModel;
    emailService;
    logger = new common_1.Logger(RealtorService_1.name);
    constructor(_realtorModel, userModel, emailService) {
        this._realtorModel = _realtorModel;
        this.userModel = userModel;
        this.emailService = emailService;
    }
    async createRealtor(createRealtorDto) {
        if (!mongoose_2.Types.ObjectId.isValid(createRealtorDto.user)) {
            throw new common_1.BadRequestException('Invalid user ID');
        }
        const realtorData = {
            ...createRealtorDto,
            user: new mongoose_2.Types.ObjectId(createRealtorDto.user),
        };
        const newRealtor = new this._realtorModel(realtorData);
        const saved = await newRealtor.save();
        const user = await this.userModel
            .findById(createRealtorDto.user)
            .select('email full_name')
            .lean();
        if (user?.email) {
            this.scheduleRealtorEmails(user.email, user.full_name || 'New Realtor');
        }
        return saved;
    }
    scheduleRealtorEmails(email, fullName) {
        void (async () => {
            try {
                await this.emailService.sendWelcomeEmail(email, fullName);
                await new Promise((resolve) => setTimeout(resolve, 600));
                const adminEmail = process.env.ADMIN_EMAIL || 'admin@kaban.ng';
                await this.emailService.sendNewRealtorAdminNotification(adminEmail, fullName, email);
                this.logger.log(`Realtor welcome & admin notification sent for user ${email}`);
            }
            catch (err) {
                this.logger.error('Failed to send welcome/admin email for new realtor', err);
            }
        })();
    }
    async findByUserId(userId) {
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        return await this._realtorModel.findOne({ user: userObjectId }).exec();
    }
    async findRealtors() {
        return await this._realtorModel
            .find()
            .populate('user', USER_POPULATE_DATA)
            .select('-__v -updatedAt')
            .exec();
    }
    async countFoundingRealtors() {
        return await this._realtorModel.countDocuments({ is_founding_realtor: true });
    }
    async findRealtor(filter, options) {
        const realtor = await this._realtorModel.findOne(filter).exec();
        if (!realtor)
            return null;
        return options?.populate
            ? realtor.populate('user', USER_POPULATE_DATA)
            : realtor;
    }
    async findRealtorById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid realtor ID format');
        }
        const realtor = await this._realtorModel
            .findById(id)
            .populate('user', 'full_name email role')
            .select('-__v -updatedAt')
            .exec();
        if (!realtor) {
            throw new common_1.NotFoundException('Realtor not found');
        }
        return realtor;
    }
    async updateRealtor(id, fields, userInfo) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid realtor ID format');
        }
        const current = await this._realtorModel.findById(id).exec();
        if (!current) {
            throw new common_1.NotFoundException('Realtor not found');
        }
        if (userInfo?.userId && userInfo?.fullName) {
            if (mongoose_2.Types.ObjectId.isValid(userInfo.userId)) {
                await this.userModel
                    .findByIdAndUpdate(userInfo.userId, { full_name: userInfo.fullName }, { new: true, runValidators: true })
                    .exec();
            }
        }
        const updateData = {};
        if (fields.realtor_pic !== undefined)
            updateData.realtor_pic = fields.realtor_pic;
        if (fields.is_founding_realtor !== undefined)
            updateData.is_founding_realtor = fields.is_founding_realtor;
        if (fields.bio !== undefined)
            updateData.bio = fields.bio;
        if (fields.company !== undefined)
            updateData.company = fields.company;
        if (fields.office_address !== undefined)
            updateData.office_address = fields.office_address;
        if (fields.service_area !== undefined)
            updateData.service_area = fields.service_area;
        if (fields.mobile_number !== undefined)
            updateData.mobile_number = fields.mobile_number;
        if (fields.whatsapp_number !== undefined)
            updateData.whatsapp_number = fields.whatsapp_number;
        if (fields.socials !== undefined)
            updateData.socials = fields.socials;
        if (fields.verification_status !== undefined)
            updateData.verification_status = fields.verification_status;
        if (fields.kyc !== undefined) {
            updateData.kyc = fields.kyc;
        }
        const updated = await this._realtorModel
            .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .select('-__v -updatedAt')
            .exec();
        if (!updated) {
            throw new common_1.NotFoundException('Realtor not found');
        }
        const cleanUpdated = updated.toObject({
            versionKey: false,
            transform: (doc, ret) => {
                ret.id = ret._id;
                delete ret._id;
                return ret;
            },
        });
        return cleanUpdated;
    }
    async deleteRealtor(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid realtor ID format');
        }
        const deleted = await this._realtorModel.findByIdAndDelete(id).exec();
        if (!deleted) {
            throw new common_1.NotFoundException('Realtor not found');
        }
        return { message: 'Realtor deleted successfully', id: deleted._id };
    }
};
exports.RealtorService = RealtorService;
exports.RealtorService = RealtorService = RealtorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(realtor_schema_1.Realtor.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        email_service_1.EmailService])
], RealtorService);
//# sourceMappingURL=realtor.service.js.map