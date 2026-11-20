"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThrottlerExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
let ThrottlerExceptionFilter = class ThrottlerExceptionFilter {
    catch(exception, host) {
        if (host.getType() === 'graphql') {
            throw exception;
        }
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const headers = exception.getHeaders?.() || {};
        let retryAfter = 60;
        const retryHeader = headers['Retry-After'];
        if (retryHeader) {
            retryAfter =
                typeof retryHeader === 'string'
                    ? parseInt(retryHeader, 10)
                    : retryHeader;
        }
        response.status(429).json({
            success: false,
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: typeof retryAfter === 'string' ? parseInt(retryAfter, 10) : retryAfter,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.ThrottlerExceptionFilter = ThrottlerExceptionFilter;
exports.ThrottlerExceptionFilter = ThrottlerExceptionFilter = __decorate([
    (0, common_1.Catch)(throttler_1.ThrottlerException)
], ThrottlerExceptionFilter);
//# sourceMappingURL=throttler-exception.filter.js.map