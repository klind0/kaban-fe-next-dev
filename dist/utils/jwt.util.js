"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTUtil = void 0;
const jwt = require("jsonwebtoken");
const common_1 = require("@nestjs/common");
let JWTUtil = class JWTUtil {
    DEFAULT_EXPIRATION = 24 * 60 * 60;
    generateToken(payload, JWT_SECRET, expiresIn = this.DEFAULT_EXPIRATION) {
        return jwt.sign(payload, JWT_SECRET, { expiresIn });
    }
    verifyToken(token, JWT_SECRET) {
        return jwt.verify(token, JWT_SECRET);
    }
};
exports.JWTUtil = JWTUtil;
exports.JWTUtil = JWTUtil = __decorate([
    (0, common_1.Injectable)()
], JWTUtil);
//# sourceMappingURL=jwt.util.js.map