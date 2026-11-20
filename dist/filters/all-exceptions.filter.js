"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const multer_config_1 = require("../common/multer/multer.config");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    logger = new common_1.Logger(AllExceptionsFilter_1.name);
    catch(exception, host) {
        if (host.getType() === 'graphql') {
            throw exception;
        }
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        this.logger.error(`Unhandled exception on ${request.method} ${request.url}`, exception instanceof Error ? exception.stack : String(exception));
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            message = typeof res === 'string' ? res : res.message || message;
            if (status === common_1.HttpStatus.BAD_REQUEST &&
                Array.isArray(res.message)) {
                message = res.message.join(', ');
            }
        }
        else if (exception &&
            typeof exception === 'object' &&
            'code' in exception &&
            typeof exception.code === 'string' &&
            exception.code.startsWith('LIMIT_')) {
            status = common_1.HttpStatus.BAD_REQUEST;
            const uploadErrors = {
                LIMIT_FILE_SIZE: `Each image must be ${multer_config_1.MAX_UPLOAD_FILE_SIZE_BYTES / (1024 * 1024)} MB or smaller`,
                LIMIT_FILE_COUNT: `A maximum of ${multer_config_1.MAX_LISTING_IMAGES} files can be uploaded at once`,
                LIMIT_UNEXPECTED_FILE: 'Unexpected file field or too many images',
                LIMIT_FIELD_COUNT: 'Too many form fields',
                LIMIT_FIELD_KEY: 'A form field name is too long',
                LIMIT_FIELD_VALUE: 'A form field value is too large',
                LIMIT_PART_COUNT: 'Too many parts in the multipart request',
            };
            message =
                uploadErrors[exception.code] || 'Invalid multipart request';
        }
        else if (exception &&
            typeof exception === 'object' &&
            'code' in exception &&
            exception.code === 11000) {
            status = common_1.HttpStatus.CONFLICT;
            const keyValue = exception.keyValue || {};
            const duplicateValues = Object.values(keyValue).join(', ');
            message = duplicateValues
                ? `Duplicate entry: ${duplicateValues} already exists`
                : 'Duplicate key error';
        }
        const isProduction = process.env.NODE_ENV === 'production';
        const errorResponse = {
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
            ...(isProduction
                ? {}
                : {
                    errorDetails: exception instanceof Error
                        ? exception.message
                        : String(exception),
                }),
        };
        response.status(status).json(errorResponse);
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map