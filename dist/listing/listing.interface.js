"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RejectionReason = exports.ListingState = exports.Status = exports.propertyCategory = void 0;
exports.propertyCategory = {
    commercial: [
        'Land',
        'Shop',
        'Hotel',
        'Office',
        'Supermarket/Mall',
        'Filling Station',
        'Restaurant',
        'Event Centre',
        'School',
    ],
    industrial: ['Factory', 'Power Plant', 'Warehouse', 'Showroom'],
    residential: [
        'Self Contain',
        'Apartment',
        'Detached House',
        'Terrace house',
        'Semi-detached House',
    ],
};
var Status;
(function (Status) {
    Status["sale"] = "sale";
    Status["rent"] = "rent";
})(Status || (exports.Status = Status = {}));
var ListingState;
(function (ListingState) {
    ListingState["DRAFT"] = "DRAFT";
    ListingState["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    ListingState["PUBLISHED"] = "PUBLISHED";
    ListingState["REJECTED"] = "REJECTED";
    ListingState["EXPIRED"] = "EXPIRED";
})(ListingState || (exports.ListingState = ListingState = {}));
var RejectionReason;
(function (RejectionReason) {
    RejectionReason["DESCRIPTION"] = "description";
    RejectionReason["PRICE"] = "price";
    RejectionReason["DETAILS"] = "details";
    RejectionReason["IMAGE"] = "image";
    RejectionReason["LOCATION"] = "location";
    RejectionReason["MAP"] = "map";
    RejectionReason["DUPLICATE"] = "duplicate";
    RejectionReason["TOS_VIOLATION"] = "tos_violation";
})(RejectionReason || (exports.RejectionReason = RejectionReason = {}));
//# sourceMappingURL=listing.interface.js.map