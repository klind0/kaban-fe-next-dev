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
var UserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./schemas/user.schema");
const realtor_schema_1 = require("../realtor/schemas/realtor.schema");
const encryption_util_1 = require("../utils/encryption.util");
const email_service_1 = require("../email/email.service");
const role_1 = require("./role");
let UserService = UserService_1 = class UserService {
    userModel;
    realtorModel;
    encryptionUtil;
    emailService;
    logger = new common_1.Logger(UserService_1.name);
    constructor(userModel, realtorModel, encryptionUtil, emailService) {
        this.userModel = userModel;
        this.realtorModel = realtorModel;
        this.encryptionUtil = encryptionUtil;
        this.emailService = emailService;
    }
    async createUser(createUserDto) {
        try {
            const normalizedEmail = createUserDto.email.toLowerCase().trim();
            const existing = await this.userModel.findOne({ email: normalizedEmail });
            if (existing) {
                throw new common_1.BadRequestException('Email already exists');
            }
            const hashedPassword = await this.encryptionUtil.encrypt(createUserDto.password);
            const newUser = new this.userModel({
                ...createUserDto,
                email: normalizedEmail,
                password: hashedPassword,
            });
            const savedUser = await newUser.save();
            return savedUser.toJSON();
        }
        catch (error) {
            if (error.code === 11000) {
                throw new common_1.BadRequestException('Email already exists');
            }
            throw error;
        }
    }
    async findUsers(filter = {}) {
        return this.userModel.find(filter).select('-password').exec();
    }
    async findUser(filter) {
        return this.userModel.findOne(filter).select('+password +resetPasswordToken +resetPasswordExpires').exec();
    }
    async findUserById(id, includePassword = false) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid user ID format');
        }
        const query = this.userModel.findById(id);
        if (includePassword) {
            query.select('+password');
        }
        return query.exec();
    }
    async findProfileById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            return null;
        }
        return this.userModel.findById(id).select('full_name role').exec();
    }
    async findProfileForAccess(id) {
        const user = await this.findProfileById(id);
        if (!user) {
            return null;
        }
        const isRealtor = user.role === role_1.Role.AGENT || user.role === role_1.Role.AGENCY;
        const realtor = isRealtor
            ? await this.realtorModel
                .findOne({ user: new mongoose_2.Types.ObjectId(id) })
                .select('mobile_number whatsapp_number')
                .exec()
            : null;
        return {
            full_name: user.full_name,
            mobile_number: realtor?.mobile_number,
            whatsapp_number: realtor?.whatsapp_number,
        };
    }
    async updateUser(id, fields) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid user ID format');
        }
        const updated = await this.userModel
            .findByIdAndUpdate(id, fields, {
            new: true,
            runValidators: true,
        })
            .exec();
        if (!updated) {
            throw new common_1.NotFoundException('User not found');
        }
        return updated;
    }
    async deleteUser(id) {
        return this.userModel.findByIdAndDelete(id).exec();
    }
    async changePassword({ id, changePasswordDto, }) {
        const user = await this.findUserById(id, true);
        if (!user) {
            throw new common_1.BadRequestException('User does not exist');
        }
        const currentPasswordHash = this.getUserPassword(user);
        if (!currentPasswordHash) {
            throw new common_1.BadRequestException('Password change not allowed for this account');
        }
        const valid = await this.encryptionUtil.compare(changePasswordDto.current_password, currentPasswordHash);
        if (!valid) {
            throw new common_1.UnauthorizedException('Wrong password');
        }
        const newPasswordHash = await this.encryptionUtil.encrypt(changePasswordDto.new_password);
        const res = await this.updateUser(id, {
            password: newPasswordHash,
        });
        if (res?._id) {
            try {
                await this.emailService.sendPasswordChangedEmail(user.email);
                this.logger.log(`Password changed email sent to ${user.email}`);
            }
            catch (err) {
                this.logger.error(`Failed to send password changed email to ${user.email}`, err);
            }
        }
        if (!res?._id) {
            throw new common_1.InternalServerErrorException();
        }
        return { message: 'Your password has been changed' };
    }
    getUserPassword(user) {
        return user.get('password', null, { getters: false });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = UserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(realtor_schema_1.Realtor.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        encryption_util_1.EncryptionUtil,
        email_service_1.EmailService])
], UserService);
//# sourceMappingURL=user.service.js.map