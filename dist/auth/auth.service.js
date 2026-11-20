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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const google_auth_library_1 = require("google-auth-library");
const crypto = require("crypto");
const user_service_1 = require("../user/user.service");
const jwt_util_1 = require("../utils/jwt.util");
const encryption_util_1 = require("../utils/encryption.util");
const role_1 = require("../user/role");
const realtor_service_1 = require("../realtor/realtor.service");
const mongoose_1 = require("mongoose");
const email_service_1 = require("../email/email.service");
let AuthService = AuthService_1 = class AuthService {
    _userService;
    _realtorService;
    _jwtService;
    _encryptionService;
    _configService;
    emailService;
    googleClient;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(_userService, _realtorService, _jwtService, _encryptionService, _configService, emailService) {
        this._userService = _userService;
        this._realtorService = _realtorService;
        this._jwtService = _jwtService;
        this._encryptionService = _encryptionService;
        this._configService = _configService;
        this.emailService = emailService;
        this.googleClient = new google_auth_library_1.OAuth2Client(this._configService.get('GOOGLE_CLIENT_ID'));
    }
    async login({ email, password }) {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await this._userService.findUser({ email: normalizedEmail });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const dbPassword = this._userService.getUserPassword(user);
        const valid = await this._encryptionService.compare(password, dbPassword);
        if (!valid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const realtor = await this._realtorService.findRealtor({
            user: new mongoose_1.Types.ObjectId(user.id),
        });
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role ?? role_1.Role.GUEST,
            realtorId: realtor?._id.toString(),
        };
        const tokens = this._getTokens(payload, { withRefresh: true });
        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                role: user.role,
                realtor: realtor,
            },
        };
    }
    async signup(createUserDto) {
        if (createUserDto.role === role_1.Role.ADMIN) {
            throw new common_1.BadRequestException('Admin accounts cannot be created through public signup');
        }
        const normalizedEmail = createUserDto.email.toLowerCase().trim();
        const user = await this._userService.createUser({
            ...createUserDto,
            email: normalizedEmail,
        });
        let realtor = null;
        if (createUserDto.role === role_1.Role.AGENT ||
            createUserDto.role === role_1.Role.AGENCY) {
            realtor = await this._realtorService.createRealtor({
                user: user.id,
            });
        }
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role ?? role_1.Role.GUEST,
            realtorId: realtor?._id?.toString(),
        };
        return {
            ...this._getTokens(payload, { withRefresh: true }),
            user,
            realtor,
        };
    }
    async loginWithGoogle(idToken) {
        const ticket = await this.googleClient.verifyIdToken({
            idToken,
            audience: this._configService.get('GOOGLE_CLIENT_ID'),
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email)
            throw new common_1.UnauthorizedException('Invalid Google token');
        let user = await this._userService.findUser({ email: payload.email });
        if (!user) {
            user = await this._userService.createUser({
                email: payload.email,
                full_name: payload.name,
                password: null,
                role: role_1.Role.AGENT,
            });
        }
        let realtor = await this._realtorService.findRealtor({
            user: new mongoose_1.Types.ObjectId(user.id),
        });
        if (!realtor) {
            realtor = await this._realtorService.createRealtor({ user: user._id });
        }
        const jwtPayload = {
            id: user.id,
            email: user.email,
            role: user.role ?? role_1.Role.GUEST,
            realtorId: realtor._id.toString(),
        };
        return {
            ...this._getTokens(jwtPayload, { withRefresh: true }),
            user,
            realtor,
        };
    }
    async forgotPassword(email) {
        const normalizedEmail = email.toLowerCase().trim();
        const generic = {
            success: true,
            message: 'If an account exists with that email, a password reset link has been sent.',
        };
        const user = await this._userService.findUser({ email: normalizedEmail });
        if (!user) {
            return generic;
        }
        const dbPassword = this._userService.getUserPassword?.(user);
        if (dbPassword == null) {
            return generic;
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();
        const frontendUrl = this._configService.get('FRONTEND_URL') || 'https://kaban-fe.netlify.app';
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
        try {
            await this.emailService.sendPasswordResetEmail(normalizedEmail, resetToken);
            this.logger.log(`Password reset email sent to ${normalizedEmail}`);
        }
        catch (err) {
            this.logger.error(`Failed to send password reset email to ${normalizedEmail}`, err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
        }
        return generic;
    }
    async resetPassword(token, newPassword) {
        if (!token?.trim() || !newPassword?.trim()) {
            throw new common_1.BadRequestException('Token and new password are required.');
        }
        if (newPassword.length < 8) {
            throw new common_1.BadRequestException('Password must be at least 8 characters.');
        }
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
        const user = await this._userService.findUser({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        });
        if (!user) {
            throw new common_1.BadRequestException('Invalid or expired reset token.');
        }
        user.password = await this._encryptionService.encrypt(newPassword);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        try {
            await this.emailService.sendPasswordChangedEmail(user.email);
            this.logger.log(`Password changed email sent to ${user.email}`);
        }
        catch (err) {
            this.logger.error(`Failed to send password changed email to ${user.email}`, err);
        }
        return {
            success: true,
            message: 'Password has been reset successfully. You can now sign in.',
        };
    }
    async refresh(refreshToken) {
        try {
            const { email, id, role, realtorId } = this._jwtService.verifyToken(refreshToken, this._configService.get('REFRESH_TOKEN_SECRET'));
            return this._getTokens({ email, id, role, realtorId }, { withRefresh: true });
        }
        catch (error) {
            throw new common_1.UnauthorizedException();
        }
    }
    _getTokens(payload, options = { withRefresh: false }) {
        const accessSecret = this._configService.get('ACCESS_TOKEN_SECRET');
        const accessExpiration = this._configService.get('ACCESS_TOKEN_EXPIRATION');
        const accessToken = this._jwtService.generateToken(payload, accessSecret, accessExpiration);
        const refreshToken = options.withRefresh
            ? this._jwtService.generateToken(payload, this._configService.get('REFRESH_TOKEN_SECRET'), this._configService.get('REFRESH_TOKEN_EXPIRATION'))
            : undefined;
        return { accessToken, refreshToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        realtor_service_1.RealtorService,
        jwt_util_1.JWTUtil,
        encryption_util_1.EncryptionUtil,
        config_1.ConfigService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map