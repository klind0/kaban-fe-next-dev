"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const listing_service_1 = require("./listing.service");
const listing_controller_1 = require("./listing.controller");
const listing_schema_1 = require("./schemas/listing.schema");
const report_schema_1 = require("./schemas/report.schema");
const report_service_1 = require("./report.service");
const cloudinary_module_1 = require("../common/cloudinary/cloudinary.module");
const email_module_1 = require("../email/email.module");
const utils_module_1 = require("../utils/utils.module");
const listing_expiration_service_1 = require("./listing.expiration.service");
const listing_resolver_1 = require("./listing.resolver");
const contact_log_schema_1 = require("./schemas/contact-log.schema");
const user_module_1 = require("../user/user.module");
const realtor_module_1 = require("../realtor/realtor.module");
const auth_module_1 = require("../auth/auth.module");
let ListingModule = class ListingModule {
};
exports.ListingModule = ListingModule;
exports.ListingModule = ListingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: listing_schema_1.Listing.name, schema: listing_schema_1.ListingSchema },
                { name: report_schema_1.Report.name, schema: report_schema_1.ReportSchema },
                { name: contact_log_schema_1.ContactLog.name, schema: contact_log_schema_1.ContactLogSchema },
            ]),
            cloudinary_module_1.CloudinaryModule,
            email_module_1.EmailModule,
            utils_module_1.UtilsModule,
            user_module_1.UserModule,
            realtor_module_1.RealtorModule,
            auth_module_1.AuthModule,
        ],
        controllers: [listing_controller_1.ListingController],
        providers: [
            listing_service_1.ListingService,
            report_service_1.ReportService,
            listing_expiration_service_1.ListingExpirationService,
            listing_resolver_1.ListingResolver,
        ],
    })
], ListingModule);
//# sourceMappingURL=listing.module.js.map