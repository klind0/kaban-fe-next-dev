"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const cookieParser = require("cookie-parser");
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const throttler_exception_filter_1 = require("./filters/throttler-exception.filter");
const all_exceptions_filter_1 = require("./filters/all-exceptions.filter");
const graphql_upload_ts_1 = require("graphql-upload-ts");
let config;
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    try {
        logger.log('Starting Kaban Backend initialization sequence...');
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        exports.config = config = app.get(config_1.ConfigService);
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:5173',
            'https://kaban.ng',
            'https://www.kaban.ng',
            'https://kaban-fe-next-dev.vercel.app',
        ];
        app.enableCors({
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                }
                else {
                    logger.warn(`Blocked CORS origin: ${origin}`);
                    callback(null, false);
                }
            },
            credentials: true,
            methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
            allowedHeaders: [
                'Content-Type',
                'Authorization',
                'Accept',
                'apollo-require-preflight',
                'x-apollo-operation-name',
                'x-requested-with',
            ],
            exposedHeaders: ['Authorization'],
            preflightContinue: false,
            optionsSuccessStatus: 204,
        });
        const http = app.getHttpAdapter().getInstance();
        http.get('/', (_req, res) => {
            res.status(200).json({
                status: 'ok',
                message: 'Kaban Backend is running',
                timestamp: new Date().toISOString(),
            });
        });
        http.head('/', (_req, res) => {
            res.status(200).end();
        });
        app.use('/api/graphql', (0, graphql_upload_ts_1.graphqlUploadExpress)({
            maxFileSize: 10_000_000,
            maxFiles: 5,
        }));
        app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
        app.useGlobalFilters(new throttler_exception_filter_1.ThrottlerExceptionFilter());
        app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'));
        app.setBaseViewsDir((0, path_1.join)(__dirname, '..', 'public'));
        app.use(cookieParser());
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: false,
        }));
        app.setGlobalPrefix('api');
        const uploadDir = (0, path_1.join)(__dirname, '..', 'uploads');
        if (!(0, fs_1.existsSync)(uploadDir)) {
            (0, fs_1.mkdirSync)(uploadDir, { recursive: true });
        }
        const port = config.get('PORT') || 3000;
        logger.log(`Attempting to bind server instance to port: ${port}...`);
        await app.listen(port, '0.0.0.0');
        logger.log(`🚀 Kaban Backend successfully running on port: ${port}`);
    }
    catch (runtimeError) {
        logger.error('❌ CRITICAL RUNTIME CRASH DURING APP BOOTSTRAP:');
        console.error(runtimeError);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map