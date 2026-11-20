import { FilterQuery, Model, Types } from 'mongoose';
import { Realtor } from './schemas/realtor.schema';
import { CreateRealtorDto } from './dto/create-realtor.dto';
import { UpdateRealtorDto } from './dto/update-realtor.dto';
import { User } from "../user/schemas/user.schema";
import { EmailService } from "../email/email.service";
export declare class RealtorService {
    private readonly _realtorModel;
    private readonly userModel;
    private readonly emailService;
    private readonly logger;
    constructor(_realtorModel: Model<Realtor>, userModel: Model<User>, emailService: EmailService);
    createRealtor(createRealtorDto: CreateRealtorDto): Promise<import("mongoose").Document<unknown, {}, Realtor> & Realtor & {
        _id: Types.ObjectId;
    }>;
    private scheduleRealtorEmails;
    findByUserId(userId: string | Types.ObjectId): Promise<import("mongoose").Document<unknown, {}, Realtor> & Realtor & {
        _id: Types.ObjectId;
    }>;
    findRealtors(): Promise<Omit<import("mongoose").Document<unknown, {}, Realtor> & Realtor & {
        _id: Types.ObjectId;
    }, never>[]>;
    countFoundingRealtors(): Promise<number>;
    findRealtor(filter: FilterQuery<Realtor>, options?: {
        populate?: boolean;
    }): Promise<Omit<import("mongoose").Document<unknown, {}, Realtor> & Realtor & {
        _id: Types.ObjectId;
    }, never>>;
    findRealtorById(id: string): Promise<import("mongoose").Document<unknown, {}, Realtor> & Realtor & {
        _id: Types.ObjectId;
    }>;
    updateRealtor(id: string, fields: UpdateRealtorDto, userInfo?: {
        userId?: string;
        fullName?: string;
    }): Promise<Realtor & {
        _id: Types.ObjectId;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    deleteRealtor(id: string): Promise<{
        message: string;
        id: Types.ObjectId;
    }>;
}
