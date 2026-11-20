"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingPayloadInterceptor = void 0;
const common_1 = require("@nestjs/common");
let ListingPayloadInterceptor = class ListingPayloadInterceptor {
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const body = request.body;
        if (!body || body.listing === undefined) {
            return next.handle();
        }
        let listingPayload = body.listing;
        if (typeof listingPayload === 'string') {
            try {
                listingPayload = JSON.parse(listingPayload);
            }
            catch {
                throw new common_1.BadRequestException('The listing form field must contain valid JSON');
            }
        }
        if (typeof listingPayload !== 'object' ||
            listingPayload === null ||
            Array.isArray(listingPayload)) {
            throw new common_1.BadRequestException('The listing form field must contain a JSON object');
        }
        const { listing: _listing, ...otherFields } = body;
        request.body = { ...listingPayload, ...otherFields };
        return next.handle();
    }
};
exports.ListingPayloadInterceptor = ListingPayloadInterceptor;
exports.ListingPayloadInterceptor = ListingPayloadInterceptor = __decorate([
    (0, common_1.Injectable)()
], ListingPayloadInterceptor);
//# sourceMappingURL=listing-payload.interceptor.js.map