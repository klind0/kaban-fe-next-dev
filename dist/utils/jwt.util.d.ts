import { IJWTPayload } from './interfaces/jwt.interface';
export declare class JWTUtil {
    DEFAULT_EXPIRATION: number;
    generateToken(payload: IJWTPayload, JWT_SECRET: string, expiresIn?: number): string;
    verifyToken(token: string, JWT_SECRET: string): IJWTPayload;
}
