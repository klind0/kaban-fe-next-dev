import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RealtorService } from "../realtor/realtor.service";
import { SignupDto } from './dto/signup.dto';
export declare class AuthResolver {
    private readonly _authService;
    private readonly _configService;
    private readonly _realtorService;
    private readonly _REFRESH_COOKIE_NAME;
    constructor(_authService: AuthService, _configService: ConfigService, _realtorService: RealtorService);
    status(): string;
    login(email: string, password: string, context: {
        res: Response;
    }): Promise<{
        accessToken: string;
        user: {
            id: any;
            email: string;
            fullName: string;
            role: import("../user/role").Role;
        };
        realtor: {
            id: any;
            realtor_pic: any;
            bio: any;
            company: any;
            office_address: any;
            service_area: any;
            mobile_number: any;
            whatsapp_number: any;
            socials: {
                [k: string]: any;
            };
            rating: any;
            verification_status: any;
            is_founding_realtor: any;
        };
    }>;
    signup(input: SignupDto, context: {
        res: Response;
    }): Promise<{
        accessToken: string;
        user: {
            id: any;
            email: string;
            fullName: string;
            role: import("../user/role").Role;
        };
        realtor: {
            id: any;
            realtor_pic: any;
            bio: any;
            company: any;
            office_address: any;
            service_area: any;
            mobile_number: any;
            whatsapp_number: any;
            socials: {
                [k: string]: any;
            };
            rating: any;
            verification_status: any;
            is_founding_realtor: any;
        };
    }>;
    loginWithGoogle(idToken: string, context: {
        res: Response;
    }): Promise<{
        accessToken: string;
        user: {
            id: any;
            email: string;
            fullName: string;
            role: import("../user/role").Role;
        };
        realtor: {
            id: any;
            realtor_pic: any;
            bio: any;
            company: any;
            office_address: any;
            service_area: any;
            mobile_number: any;
            whatsapp_number: any;
            socials: {
                [k: string]: any;
            };
            rating: any;
            verification_status: any;
            is_founding_realtor: any;
        };
    }>;
    forgotPassword(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
    refresh(context: {
        req: {
            cookies: Record<string, string>;
        };
    }): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    private _setRefreshCookie;
    private _mapRealtor;
}
