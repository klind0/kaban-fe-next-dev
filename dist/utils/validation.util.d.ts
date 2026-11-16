declare enum Environment {
    Development = "development",
    Production = "production",
    Test = "test"
}
declare class EnvironmentVariables {
    NODE_ENV: Environment;
    PORT: number;
    MONGO_URI: string;
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
    CLOUDINARY_FOLDER: string;
    RESEND_API_KEY: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    ACCESS_TOKEN_EXPIRATION: number;
    REFRESH_TOKEN_EXPIRATION: number;
    GOOGLE_CLIENT_ID: string;
    LISTING_EXPIRATION_DAYS: number;
}
export declare function validateEnv(config: Record<string, unknown>): EnvironmentVariables;
export {};
