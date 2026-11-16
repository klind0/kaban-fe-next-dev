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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const create_user_dto_1 = require("../user/dto/create-user.dto");
const realtor_service_1 = require("../realtor/realtor.service");
const success_interceptors_1 = require("../common/interceptors/success.interceptors");
const throttler_1 = require("@nestjs/throttler");
const forgot_password_dto_1 = require("./dto/forgot-password.dto");
const reset_password_dto_1 = require("./dto/reset-password.dto");
let AuthController = class AuthController {
    _authService;
    _configService;
    _realtorService;
    _REFRESH_COOKIE_NAME = 'kabanRefresh';
    _COOKIE_OPTIONS;
    constructor(_authService, _configService, _realtorService) {
        this._authService = _authService;
        this._configService = _configService;
        this._realtorService = _realtorService;
        this._COOKIE_OPTIONS = {
            httpOnly: true,
            secure: this._configService.get('NODE_ENV') === 'production',
            maxAge: 3 * 24 * 60 * 60 * 1000,
        };
    }
    async login(res, loginDto) {
        const { accessToken, refreshToken, user } = await this._authService.login(loginDto);
        const realtor = await this._realtorService.findRealtor({ user: user.id });
        res.cookie(this._REFRESH_COOKIE_NAME, refreshToken, this._COOKIE_OPTIONS);
        return {
            accessToken,
            email: user.email,
            fullName: user.fullName,
            realtor: realtor
                ? {
                    id: realtor.id,
                    realtor_pic: realtor.realtor_pic,
                    bio: realtor.bio,
                    company: realtor.company,
                    office_address: realtor.office_address,
                    service_area: realtor.service_area,
                    mobile_number: realtor.mobile_number,
                    whatsapp_number: realtor.whatsapp_number,
                    socials: realtor.socials
                        ? Object.fromEntries(realtor.socials)
                        : null,
                    rating: realtor.rating,
                    verification_status: realtor.verification_status,
                    is_founding_realtor: realtor.is_founding_realtor ?? false,
                }
                : null,
        };
    }
    async createUser(res, createUserDto) {
        const { accessToken, refreshToken, user, realtor } = await this._authService.signup(createUserDto);
        res.cookie(this._REFRESH_COOKIE_NAME, refreshToken, this._COOKIE_OPTIONS);
        return {
            accessToken,
            email: user.email,
            fullName: user.full_name,
            realtor: realtor
                ? {
                    id: realtor.id,
                    realtor_pic: realtor.realtor_pic,
                    bio: realtor.bio,
                    company: realtor.company,
                    office_address: realtor.office_address,
                    service_area: realtor.service_area,
                    mobile_number: realtor.mobile_number,
                    whatsapp_number: realtor.whatsapp_number,
                    socials: realtor.socials
                        ? Object.fromEntries(realtor.socials)
                        : null,
                    rating: realtor.rating,
                    verification_status: realtor.verification_status,
                    is_founding_realtor: realtor.is_founding_realtor ?? false,
                }
                : null,
        };
    }
    async loginWithGoogle(res, idToken) {
        const { accessToken, refreshToken, user } = await this._authService.loginWithGoogle(idToken);
        let realtor = await this._realtorService.findRealtor({ user: user.id });
        if (!realtor) {
            realtor = await this._realtorService.createRealtor({ user: user._id });
        }
        res.cookie(this._REFRESH_COOKIE_NAME, refreshToken, this._COOKIE_OPTIONS);
        return {
            accessToken,
            email: user.email,
            fullName: user.full_name,
            realtor: {
                id: realtor.id,
                realtor_pic: realtor.realtor_pic,
                bio: realtor.bio,
                company: realtor.company,
                office_address: realtor.office_address,
                service_area: realtor.service_area,
                mobile_number: realtor.mobile_number,
                whatsapp_number: realtor.whatsapp_number,
                socials: realtor.socials ? Object.fromEntries(realtor.socials) : null,
                rating: realtor.rating,
                verification_status: realtor.verification_status,
                is_founding_realtor: realtor.is_founding_realtor ?? false,
            },
        };
    }
    async forgotPassword(dto) {
        return await this._authService.forgotPassword(dto.email);
    }
    async resetPassword(dto) {
        return await this._authService.resetPassword(dto.token, dto.newPassword);
    }
    async refresh(req) {
        const refreshToken = req.cookies[this._REFRESH_COOKIE_NAME];
        if (!refreshToken)
            throw new common_1.UnauthorizedException();
        return await this._authService.refresh(refreshToken);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ auth: {} }),
    (0, swagger_1.ApiOperation)({ summary: 'Login with email and password' }),
    (0, swagger_1.ApiBody)({ type: login_dto_1.LoginDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Login successful',
        type: login_dto_1.AuthResponse,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('signup'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, throttler_1.Throttle)({ short: {} }),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new user account' }),
    (0, swagger_1.ApiBody)({ type: create_user_dto_1.CreateUserDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'User created successfully',
        type: login_dto_1.AuthResponse,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - validation error',
    }),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "createUser", null);
__decorate([
    (0, common_1.Post)('google'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ auth: {} }),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __param(1, (0, common_1.Body)('idToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginWithGoogle", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ short: {} }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ short: {} }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Get)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 30, ttl: 600000 } }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.UseInterceptors)(success_interceptors_1.SuccessInterceptor),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        config_1.ConfigService,
        realtor_service_1.RealtorService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map