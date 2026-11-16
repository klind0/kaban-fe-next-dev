export declare const LISTING_EXPIRATION_DAYS = 30;
export declare function getListingExpirationDate(publishedAt: Date | string | null | undefined, legacyExpiresAt?: Date | string | null): Date | null;
export declare function isListingExpired(publishedAt: Date | string | null | undefined, now?: Date, legacyExpiresAt?: Date | string | null): boolean;
export declare class ListingExpirationUtil {
    getExpirationDate(publishedAt?: Date): Date;
    getExpirationDurationMs(): number;
    isExpired(publishedAt: Date | null | undefined, legacyExpiresAt?: Date | null): boolean;
    getDaysUntilExpiration(publishedAt: Date | null | undefined, legacyExpiresAt?: Date | null): number;
}
