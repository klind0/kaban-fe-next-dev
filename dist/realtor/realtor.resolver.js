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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtorResolver = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
const graphql_upload_ts_1 = require("graphql-upload-ts");
const realtor_service_1 = require("./realtor.service");
const jwt_util_1 = require("../utils/jwt.util");
const config_1 = require("@nestjs/config");
const realtor_schema_1 = require("./schemas/realtor.schema");
const cloudinary_service_1 = require("../common/cloudinary/cloudinary.service");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const update_realtor_dto_1 = require("./dto/update-realtor.dto");
let RealtorResolver = class RealtorResolver {
    _realtorService;
    _cloudinaryService;
    _jwtUtil;
    _configService;
    constructor(_realtorService, _cloudinaryService, _jwtUtil, _configService) {
        this._realtorService = _realtorService;
        this._cloudinaryService = _cloudinaryService;
        this._jwtUtil = _jwtUtil;
        this._configService = _configService;
    }
    async updateRealtor(id, input, realtorPic, governmentId, realtorCertification, context) {
        const user = this._getUserFromContext(context);
        if (user.realtorId !== id) {
            throw new common_1.ForbiddenException('You can only update your own realtor profile');
        }
        if (input.is_founding_realtor !== undefined) {
            throw new common_1.ForbiddenException('Use the admin founding-realtor endpoint to change this badge');
        }
        if (input.verification_status !== undefined) {
            throw new common_1.ForbiddenException('Verification status can only be changed by an administrator');
        }
        const updateData = (0, class_transformer_1.plainToInstance)(update_realtor_dto_1.UpdateRealtorDto, input);
        const validationErrors = await (0, class_validator_1.validate)(updateData, {
            whitelist: true,
            forbidNonWhitelisted: true,
        });
        if (validationErrors.length) {
            throw new common_1.BadRequestException(validationErrors.flatMap((error) => Object.values(error.constraints || {})));
        }
        const fullName = updateData.full_name;
        delete updateData.full_name;
        const filesToUpload = [];
        const fileKeys = [];
        if (realtorPic) {
            filesToUpload.push(realtorPic);
            fileKeys.push('realtor_pic');
        }
        if (governmentId) {
            filesToUpload.push(governmentId);
            fileKeys.push('government_id');
        }
        if (realtorCertification) {
            filesToUpload.push(realtorCertification);
            fileKeys.push('realtor_certification');
        }
        if (filesToUpload.length > 0) {
            const resolvedFiles = await Promise.all(filesToUpload.map(async (filePromise) => {
                const file = await filePromise;
                const stream = file.createReadStream();
                const chunks = [];
                for await (const chunk of stream) {
                    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
                }
                const buffer = Buffer.concat(chunks);
                return {
                    fieldname: 'file',
                    originalname: file.filename,
                    encoding: '7bit',
                    mimetype: file.mimetype,
                    buffer,
                    size: buffer.length,
                };
            }));
            const folder = `kaban/realtors/${id}`;
            const uploaded = await this._cloudinaryService.uploadImages(resolvedFiles, { folder });
            uploaded.forEach((img, index) => {
                const key = fileKeys[index];
                if (key === 'realtor_pic') {
                    updateData.realtor_pic = img.url;
                }
                else if (key === 'government_id') {
                    updateData.kyc.government_id = img.url;
                    updateData.verification_status = realtor_schema_1.VERIFICATION_STATUS.PENDING;
                }
                else if (key === 'realtor_certification') {
                    updateData.kyc.realtor_certification = img.url;
                    updateData.verification_status = realtor_schema_1.VERIFICATION_STATUS.PENDING;
                }
            });
        }
        return this._realtorService.updateRealtor(id, updateData, {
            userId: user.userId || user.id,
            fullName,
        });
    }
    _getUserFromContext(context) {
        const request = context?.req;
        const [type, token] = request?.headers?.authorization?.split(' ') ?? [];
        if (type !== 'Bearer' || !token) {
            throw new common_1.UnauthorizedException('Authentication token required');
        }
        try {
            return this._jwtUtil.verifyToken(token, this._configService.get('ACCESS_TOKEN_SECRET'));
        }
        catch (err) {
            if (err.name === 'TokenExpiredError') {
                throw new common_1.UnauthorizedException('Token has expired');
            }
            throw new common_1.UnauthorizedException('Authentication failed');
        }
    }
};
exports.RealtorResolver = RealtorResolver;
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input', { type: () => graphql_type_json_1.GraphQLJSONObject })),
    __param(2, (0, graphql_1.Args)('realtor_pic', { type: () => graphql_upload_ts_1.GraphQLUpload, nullable: true })),
    __param(3, (0, graphql_1.Args)('government_id', { type: () => graphql_upload_ts_1.GraphQLUpload, nullable: true })),
    __param(4, (0, graphql_1.Args)('realtor_certification', { type: () => graphql_upload_ts_1.GraphQLUpload, nullable: true })),
    __param(5, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], RealtorResolver.prototype, "updateRealtor", null);
exports.RealtorResolver = RealtorResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [realtor_service_1.RealtorService,
        cloudinary_service_1.CloudinaryService,
        jwt_util_1.JWTUtil,
        config_1.ConfigService])
], RealtorResolver);
//# sourceMappingURL=realtor.resolver.js.map