"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const user_module_1 = require("../user/user.module");
const realtor_module_1 = require("../realtor/realtor.module");
const jwt_util_1 = require("../utils/jwt.util");
const auth_guard_1 = require("./auth.guard");
const email_module_1 = require("../email/email.module");
const auth_resolver_1 = require("./auth.resolver");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [user_module_1.UserModule, realtor_module_1.RealtorModule, email_module_1.EmailModule],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, jwt_util_1.JWTUtil, auth_guard_1.OptionalAuthGuard, auth_resolver_1.AuthResolver],
        exports: [jwt_util_1.JWTUtil, auth_guard_1.OptionalAuthGuard],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map