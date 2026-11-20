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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const auth_guard_1 = require("../auth/auth.guard");
const mongooseClassSerializer_interceptor_1 = require("../utils/mongooseClassSerializer.interceptor");
const user_schema_1 = require("./schemas/user.schema");
const change_password_dto_1 = require("./dto/change-password.dto");
const role_1 = require("./role");
const success_interceptors_1 = require("../common/interceptors/success.interceptors");
let UserController = class UserController {
    _userService;
    constructor(_userService) {
        this._userService = _userService;
    }
    async createUser(createUserDto) {
        if (createUserDto.role === role_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Admin accounts cannot be created through public signup');
        }
        return await this._userService.createUser(createUserDto);
    }
    async getUsers(req) {
        if (req.user?.role !== role_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Admin access required to list all users');
        }
        return await this._userService.findUsers();
    }
    async getUser(userId, req) {
        if (req.user.id !== userId && req.user.role !== role_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('You can only view your own profile');
        }
        return await this._userService.findUserById(userId);
    }
    async updateUser(id, updateUserDto, req) {
        if (req.user.id !== id) {
            throw new common_1.ForbiddenException('You can only update your own profile');
        }
        return await this._userService.updateUser(id, updateUserDto);
    }
    async deleteUser(userId, req) {
        if (req.user.id !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own profile');
        }
        return await this._userService.deleteUser(userId);
    }
    async changePassword(req, userId, changePasswordDto) {
        if (req.user.id !== userId) {
            throw new common_1.UnauthorizedException('Not authorized to change this password');
        }
        return await this._userService.changePassword({
            id: userId,
            changePasswordDto,
        });
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createUser", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUsers", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUser", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateUser", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Patch)(':id/change-password'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "changePassword", null);
exports.UserController = UserController = __decorate([
    (0, common_1.UseInterceptors)(success_interceptors_1.SuccessInterceptor),
    (0, common_1.Controller)('users'),
    (0, common_1.UseInterceptors)((0, mongooseClassSerializer_interceptor_1.default)(user_schema_1.User)),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map