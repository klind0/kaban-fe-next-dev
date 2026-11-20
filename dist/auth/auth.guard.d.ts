import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JWTUtil } from "../utils/jwt.util";
import { UserService } from "../user/user.service";
export declare class AuthGuard implements CanActivate {
    private readonly jwtService;
    private readonly configService;
    private readonly userService;
    constructor(jwtService: JWTUtil, configService: ConfigService, userService: UserService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private _isProfileEdit;
    private _extractTokenFromHeader;
}
export declare class OptionalAuthGuard implements CanActivate {
    private readonly jwtService;
    private readonly configService;
    constructor(jwtService: JWTUtil, configService: ConfigService);
    canActivate(context: ExecutionContext): boolean;
}
