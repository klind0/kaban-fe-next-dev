"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const gql_throttler_guard_1 = require("./common/guards/gql-throttler.guard");
const graphql_1 = require("@nestjs/graphql");
const apollo_1 = require("@nestjs/apollo");
const graphql_type_json_1 = require("graphql-type-json");
const complexity_plugin_1 = require("./common/plugins/complexity.plugin");
const email_module_1 = require("./email/email.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const user_module_1 = require("./user/user.module");
const utils_module_1 = require("./utils/utils.module");
const validation_util_1 = require("./utils/validation.util");
const auth_module_1 = require("./auth/auth.module");
const mongo_exception_filter_1 = require("./filters/mongo-exception.filter");
const realtor_module_1 = require("./realtor/realtor.module");
const listing_module_1 = require("./listing/listing.module");
const cloudinary_module_1 = require("./common/cloudinary/cloudinary.module");
const schedule_1 = require("@nestjs/schedule");
const graphql_upload_ts_1 = require("graphql-upload-ts");
const depthLimit = require('graphql-depth-limit');
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            config_1.ConfigModule.forRoot({ validate: validation_util_1.validateEnv, isGlobal: true }),
            graphql_1.GraphQLModule.forRootAsync({
                driver: apollo_1.ApolloDriver,
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    return {
                        path: '/api/graphql',
                        autoSchemaFile: true,
                        playground: process.env.NODE_ENV !== 'production',
                        introspection: process.env.NODE_ENV !== 'production',
                        context: ({ req, res }) => ({ req, res }),
                        validationRules: [depthLimit(7)],
                        plugins: [complexity_plugin_1.complexityPlugin],
                        buildSchemaOptions: {
                            scalarsMap: [{ type: () => Object, scalar: graphql_type_json_1.default }],
                        },
                        resolvers: {
                            Upload: graphql_upload_ts_1.GraphQLUpload,
                        },
                    };
                },
            }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const uri = config.get('MONGO_URI');
                    if (!uri) {
                        throw new Error('MONGO_URI is not defined');
                    }
                    return {
                        uri,
                        family: 4,
                        serverSelectionTimeoutMS: 5000,
                        socketTimeoutMS: 45000,
                        retryAttempts: 5,
                        retryDelay: 3000,
                    };
                },
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    name: 'default',
                    ttl: 60_000,
                    limit: 200,
                },
                {
                    name: 'auth',
                    ttl: 60_000,
                    limit: 20,
                },
                {
                    name: 'short',
                    ttl: 10_000,
                    limit: 40,
                },
            ]),
            user_module_1.UserModule,
            utils_module_1.UtilsModule,
            auth_module_1.AuthModule,
            realtor_module_1.RealtorModule,
            listing_module_1.ListingModule,
            cloudinary_module_1.CloudinaryModule,
            email_module_1.EmailModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_FILTER,
                useClass: mongo_exception_filter_1.MongoExceptionFilter,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: gql_throttler_guard_1.GqlThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map