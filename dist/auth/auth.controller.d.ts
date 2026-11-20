import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthResponse, LoginDto } from './dto/login.dto';
import { CreateUserDto } from "../user/dto/create-user.dto";
import { RealtorService } from "../realtor/realtor.service";
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthController {
    private _authService;
    private _configService;
    private _realtorService;
    private readonly _REFRESH_COOKIE_NAME;
    private readonly _COOKIE_OPTIONS;
    constructor(_authService: AuthService, _configService: ConfigService, _realtorService: RealtorService);
    login(res: Response, loginDto: LoginDto): Promise<AuthResponse>;
    createUser(res: Response, createUserDto: CreateUserDto): Promise<AuthResponse>;
    loginWithGoogle(res: Response, idToken: string): Promise<AuthResponse>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    refresh(req: Request): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}
