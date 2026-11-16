import { RealtorService } from './realtor.service';
import { CreateRealtorDto } from './dto/create-realtor.dto';
import { UpdateRealtorDto } from './dto/update-realtor.dto';
import { SetFoundingRealtorDto } from './dto/set-founding-realtor.dto';
import RequestWithUser from "../auth/requestWithUser.interface";
import { CloudinaryService } from "../common/cloudinary/cloudinary.service";
export declare class RealtorController {
    private _realtorService;
    private _cloudinaryService;
    private readonly logger;
    constructor(_realtorService: RealtorService, _cloudinaryService: CloudinaryService);
    createRealtor(createRealtorDto: CreateRealtorDto, req: RequestWithUser): Promise<import("mongoose").Document<unknown, {}, import("./schemas/realtor.schema").Realtor> & import("./schemas/realtor.schema").Realtor & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    getRealtors(req: RequestWithUser): Promise<Omit<import("mongoose").Document<unknown, {}, import("./schemas/realtor.schema").Realtor> & import("./schemas/realtor.schema").Realtor & {
        _id: import("mongoose").Types.ObjectId;
    }, never>[]>;
    getRealtor(realtorId: string, req: RequestWithUser): Promise<import("mongoose").Document<unknown, {}, import("./schemas/realtor.schema").Realtor> & import("./schemas/realtor.schema").Realtor & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    setFoundingRealtor(id: string, dto: SetFoundingRealtorDto, req: RequestWithUser): Promise<import("./schemas/realtor.schema").Realtor & {
        _id: import("mongoose").Types.ObjectId;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    updateRealtor(id: string, files: {
        realtor_pic?: Express.Multer.File[];
        government_id?: Express.Multer.File[];
        realtor_certification?: Express.Multer.File[];
    }, updateRealtorDto: UpdateRealtorDto, req: RequestWithUser): Promise<import("./schemas/realtor.schema").Realtor & {
        _id: import("mongoose").Types.ObjectId;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    deleteRealtor(realtorId: string, req: RequestWithUser): Promise<{
        message: string;
        id: import("mongoose").Types.ObjectId;
    }>;
}
