import { RealtorService } from './realtor.service';
import { JWTUtil } from "../utils/jwt.util";
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from "../common/cloudinary/cloudinary.service";
export declare class RealtorResolver {
    private readonly _realtorService;
    private readonly _cloudinaryService;
    private readonly _jwtUtil;
    private readonly _configService;
    constructor(_realtorService: RealtorService, _cloudinaryService: CloudinaryService, _jwtUtil: JWTUtil, _configService: ConfigService);
    updateRealtor(id: string, input: Record<string, any>, realtorPic?: any, governmentId?: any, realtorCertification?: any, context?: {
        req: any;
    }): Promise<import("./schemas/realtor.schema").Realtor & {
        _id: import("mongoose").Types.ObjectId;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    private _getUserFromContext;
}
