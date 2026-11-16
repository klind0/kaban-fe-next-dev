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
exports.AuthResolver = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
const auth_service_1 = require("./auth.service");
const realtor_service_1 = require("../realtor/realtor.service");
const signup_dto_1 = require("./dto/signup.dto");
let AuthResolver = class AuthResolver {
    _authService;
    _configService;
    _realtorService;
    _REFRESH_COOKIE_NAME = 'kabanRefresh';
    constructor(_authService, _configService, _realtorService) {
        this._authService = _authService;
        this._configService = _configService;
        this._realtorService = _realtorService;
    }
    status() {
        return 'ok';
    }
    async login(email, password, context) {
        const { accessToken, refreshToken, user } = await this._authService.login({
            email,
            password,
        });
        this._setRefreshCookie(context.res, refreshToken);
        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
            realtor: user.realtor ? this._mapRealtor(user.realtor) : null,
        };
    }
    async signup(input, context) {
        const { accessToken, refreshToken, user, realtor } = await this._authService.signup(input);
        this._setRefreshCookie(context.res, refreshToken);
        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                role: user.role,
            },
            realtor: realtor ? this._mapRealtor(realtor) : null,
        };
    }
    async loginWithGoogle(idToken, context) {
        const { accessToken, refreshToken, user, realtor } = await this._authService.loginWithGoogle(idToken);
        this._setRefreshCookie(context.res, refreshToken);
        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                role: user.role,
            },
            realtor: realtor ? this._mapRealtor(realtor) : null,
        };
    }
    async forgotPassword(email) {
        return this._authService.forgotPassword(email);
    }
    async resetPassword(token, newPassword) {
        return this._authService.resetPassword(token, newPassword);
    }
    async refresh(context) {
        const refreshToken = context.req?.cookies?.[this._REFRESH_COOKIE_NAME];
        if (!refreshToken) {
            throw new common_1.UnauthorizedException();
        }
        return this._authService.refresh(refreshToken);
    }
    _setRefreshCookie(res, refreshToken) {
        const options = {
            httpOnly: true,
            secure: this._configService.get('NODE_ENV') === 'production',
            maxAge: 3 * 24 * 60 * 60 * 1000,
        };
        res.cookie(this._REFRESH_COOKIE_NAME, refreshToken, options);
    }
    _mapRealtor(realtor) {
        return {
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
        };
    }
};
exports.AuthResolver = AuthResolver;
__decorate([
    (0, graphql_1.Query)(() => String),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthResolver.prototype, "status", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject),
    __param(0, (0, graphql_1.Args)('email', { type: () => String })),
    __param(1, (0, graphql_1.Args)('password', { type: () => String })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "login", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject),
    __param(0, (0, graphql_1.Args)('input', { type: () => signup_dto_1.SignupDto })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signup_dto_1.SignupDto, Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "signup", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject),
    __param(0, (0, graphql_1.Args)('idToken', { type: () => String })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "loginWithGoogle", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject),
    __param(0, (0, graphql_1.Args)('email', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "forgotPassword", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject),
    __param(0, (0, graphql_1.Args)('token', { type: () => String })),
    __param(1, (0, graphql_1.Args)('newPassword', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "resetPassword", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject),
    __param(0, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "refresh", null);
exports.AuthResolver = AuthResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        config_1.ConfigService,
        realtor_service_1.RealtorService])
], AuthResolver);
//# sourceMappingURL=auth.resolver.js.map