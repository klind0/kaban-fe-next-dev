"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
let MongoExceptionFilter = class MongoExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            return response.status(status).json(exceptionResponse);
        }
        if (exception?.code === 11000) {
            return response.status(common_1.HttpStatus.CONFLICT).json({
                statusCode: common_1.HttpStatus.CONFLICT,
                error: 'Duplicate key error',
                fields: exception.keyValue,
            });
        }
        if (exception instanceof mongoose_1.Error.ValidationError) {
            return response.status(common_1.HttpStatus.BAD_REQUEST).json({
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                error: 'Validation error',
                messages: Object.values(exception.errors).map((err) => err.message),
            });
        }
        if (exception instanceof mongoose_1.Error.CastError) {
            return response.status(common_1.HttpStatus.BAD_REQUEST).json({
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                error: `Invalid ${exception.path}`,
            });
        }
        console.error('[MongoExceptionFilter]', exception);
        return response.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Internal server error',
        });
    }
};
exports.MongoExceptionFilter = MongoExceptionFilter;
exports.MongoExceptionFilter = MongoExceptionFilter = __decorate([
    (0, common_1.Catch)()
], MongoExceptionFilter);
//# sourceMappingURL=mongo-exception.filter.js.map