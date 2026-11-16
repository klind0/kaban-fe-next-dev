import { ConfigService } from '@nestjs/config';
import { UserService } from "../user/user.service";
import { JWTUtil } from "../utils/jwt.util";
import { EncryptionUtil } from "../utils/encryption.util";
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from "../user/dto/create-user.dto";
import { Role } from "../user/role";
import { RealtorService } from "../realtor/realtor.service";
import { Types } from 'mongoose';
import { EmailService } from "../email/email.service";
export declare class AuthService {
    private _userService;
    private _realtorService;
    private _jwtService;
    private _encryptionService;
    private _configService;
    private readonly emailService;
    private googleClient;
    private readonly logger;
    constructor(_userService: UserService, _realtorService: RealtorService, _jwtService: JWTUtil, _encryptionService: EncryptionUtil, _configService: ConfigService, emailService: EmailService);
    login({ email, password }: LoginDto): Promise<{
        user: {
            id: any;
            email: string;
            fullName: string;
            role: Role;
            realtor: Omit<import("mongoose").Document<unknown, {}, import("../realtor/schemas/realtor.schema").Realtor> & import("../realtor/schemas/realtor.schema").Realtor & {
                _id: Types.ObjectId;
            }, never>;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    signup(createUserDto: CreateUserDto): Promise<{
        user: import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("../user/schemas/user.schema").User> & import("../user/schemas/user.schema").User & {
            _id: Types.ObjectId;
        } & Required<{
            _id: Types.ObjectId;
        }>>;
        realtor: any;
        accessToken: string;
        refreshToken: string;
    }>;
    loginWithGoogle(idToken: string): Promise<{
        user: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../user/schemas/user.schema").User> & import("../user/schemas/user.schema").User & {
            _id: Types.ObjectId;
        }> & import("mongoose").Document<unknown, {}, import("../user/schemas/user.schema").User> & import("../user/schemas/user.schema").User & {
            _id: Types.ObjectId;
        } & Required<{
            _id: Types.ObjectId;
        }>;
        realtor: Omit<import("mongoose").Document<unknown, {}, import("../realtor/schemas/realtor.schema").Realtor> & import("../realtor/schemas/realtor.schema").Realtor & {
            _id: Types.ObjectId;
        }, never>;
        accessToken: string;
        refreshToken: string;
    }>;
    forgotPassword(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    private _getTokens;
}
