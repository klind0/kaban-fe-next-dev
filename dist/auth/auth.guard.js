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
exports.OptionalAuthGuard = exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_util_1 = require("../utils/jwt.util");
const user_service_1 = require("../user/user.service");
const profile_completion_util_1 = require("../user/profile-completion.util");
const role_1 = require("../user/role");
let AuthGuard = class AuthGuard {
    jwtService;
    configService;
    userService;
    constructor(jwtService, configService, userService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.userService = userService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = this._extractTokenFromHeader(request);
        if (!token) {
            throw new common_1.UnauthorizedException('Authentication token required');
        }
        try {
            request.user = this.jwtService.verifyToken(token, this.configService.get('ACCESS_TOKEN_SECRET'));
        }
        catch (err) {
            if (err.name === 'TokenExpiredError') {
                throw new common_1.UnauthorizedException('Token has expired');
            }
            if (err.name === 'JsonWebTokenError') {
                throw new common_1.UnauthorizedException('Invalid token signature');
            }
            throw new common_1.UnauthorizedException('Authentication failed');
        }
        if (request.user.role === role_1.Role.ADMIN || this._isProfileEdit(request)) {
            return true;
        }
        const user = await this.userService.findProfileForAccess(request.user.id);
        const missingFields = (0, profile_completion_util_1.getMissingProfileFields)(request.user.role, user?.full_name, user?.mobile_number, user?.whatsapp_number);
        if (missingFields.length) {
            throw new common_1.ForbiddenException({
                code: 'PROFILE_INCOMPLETE',
                message: 'Complete your profile before accessing this resource.',
                missingFields,
            });
        }
        return true;
    }
    _isProfileEdit(request) {
        if (request.method !== 'PUT')
            return false;
        return /^\/(?:api\/)?(?:users|realtors)\/[^/]+\/?$/i.test(request.path);
    }
    _extractTokenFromHeader(request) {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_util_1.JWTUtil,
        config_1.ConfigService,
        user_service_1.UserService])
], AuthGuard);
let OptionalAuthGuard = class OptionalAuthGuard {
    jwtService;
    configService;
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        if (!type && !token)
            return true;
        if (type !== 'Bearer' || !token) {
            throw new common_1.UnauthorizedException('Invalid authorization header');
        }
        try {
            request.user = this.jwtService.verifyToken(token, this.configService.get('ACCESS_TOKEN_SECRET'));
            return true;
        }
        catch (err) {
            if (err.name === 'TokenExpiredError') {
                throw new common_1.UnauthorizedException('Token has expired');
            }
            if (err.name === 'JsonWebTokenError') {
                throw new common_1.UnauthorizedException('Invalid token signature');
            }
            throw new common_1.UnauthorizedException('Authentication failed');
        }
    }
};
exports.OptionalAuthGuard = OptionalAuthGuard;
exports.OptionalAuthGuard = OptionalAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_util_1.JWTUtil,
        config_1.ConfigService])
], OptionalAuthGuard);
//# sourceMappingURL=auth.guard.js.map