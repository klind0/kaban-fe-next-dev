"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingExpirationUtil = exports.LISTING_EXPIRATION_DAYS = void 0;
exports.getListingExpirationDate = getListingExpirationDate;
exports.isListingExpired = isListingExpired;
const common_1 = require("@nestjs/common");
exports.LISTING_EXPIRATION_DAYS = 30;
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
function getListingExpirationDate(publishedAt, legacyExpiresAt) {
    if (!publishedAt) {
        return legacyExpiresAt ? new Date(legacyExpiresAt) : null;
    }
    return new Date(new Date(publishedAt).getTime() +
        exports.LISTING_EXPIRATION_DAYS * DAY_IN_MILLISECONDS);
}
function isListingExpired(publishedAt, now = new Date(), legacyExpiresAt) {
    const expiresAt = getListingExpirationDate(publishedAt, legacyExpiresAt);
    return Boolean(expiresAt && now >= expiresAt);
}
let ListingExpirationUtil = class ListingExpirationUtil {
    getExpirationDate(publishedAt = new Date()) {
        return getListingExpirationDate(publishedAt);
    }
    getExpirationDurationMs() {
        return exports.LISTING_EXPIRATION_DAYS * DAY_IN_MILLISECONDS;
    }
    isExpired(publishedAt, legacyExpiresAt) {
        return isListingExpired(publishedAt, new Date(), legacyExpiresAt);
    }
    getDaysUntilExpiration(publishedAt, legacyExpiresAt) {
        const expiresAt = getListingExpirationDate(publishedAt, legacyExpiresAt);
        if (!expiresAt)
            return 0;
        const now = new Date();
        const diffTime = expiresAt.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
        return Math.max(0, diffDays);
    }
};
exports.ListingExpirationUtil = ListingExpirationUtil;
exports.ListingExpirationUtil = ListingExpirationUtil = __decorate([
    (0, common_1.Injectable)()
], ListingExpirationUtil);
//# sourceMappingURL=listingExpiration.util.js.map