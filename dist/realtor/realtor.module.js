"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtorModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const realtor_service_1 = require("./realtor.service");
const realtor_controller_1 = require("./realtor.controller");
const realtor_schema_1 = require("./schemas/realtor.schema");
const utils_module_1 = require("../utils/utils.module");
const user_schema_1 = require("../user/schemas/user.schema");
const email_module_1 = require("../email/email.module");
const realtor_resolver_1 = require("./realtor.resolver");
const user_module_1 = require("../user/user.module");
let RealtorModule = class RealtorModule {
};
exports.RealtorModule = RealtorModule;
exports.RealtorModule = RealtorModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: realtor_schema_1.Realtor.name, schema: realtor_schema_1.RealtorSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
            ]),
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.memoryStorage)(),
            }),
            utils_module_1.UtilsModule,
            email_module_1.EmailModule,
            user_module_1.UserModule,
        ],
        providers: [realtor_service_1.RealtorService, realtor_resolver_1.RealtorResolver],
        controllers: [realtor_controller_1.RealtorController],
        exports: [realtor_service_1.RealtorService],
    })
], RealtorModule);
//# sourceMappingURL=realtor.module.js.map