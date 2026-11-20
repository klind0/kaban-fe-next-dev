import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Realtor } from "../realtor/schemas/realtor.schema";
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { EncryptionUtil } from "../utils/encryption.util";
import { EmailService } from "../email/email.service";
export declare class UserService {
    private readonly userModel;
    private readonly realtorModel;
    private readonly encryptionUtil;
    private readonly emailService;
    private readonly logger;
    constructor(userModel: Model<UserDocument>, realtorModel: Model<Realtor>, encryptionUtil: EncryptionUtil, emailService: EmailService);
    createUser(createUserDto: CreateUserDto): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, User> & User & {
        _id: Types.ObjectId;
    } & Required<{
        _id: Types.ObjectId;
    }>>>;
    findUsers(filter?: FilterQuery<User>): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, User> & User & {
        _id: Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, User> & User & {
        _id: Types.ObjectId;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    findUser(filter: FilterQuery<User>): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, User> & User & {
        _id: Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, User> & User & {
        _id: Types.ObjectId;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    findUserById(id: string, includePassword?: boolean): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, User> & User & {
        _id: Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, User> & User & {
        _id: Types.ObjectId;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    findProfileById(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, User> & User & {
        _id: Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, User> & User & {
        _id: Types.ObjectId;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    findProfileForAccess(id: string): Promise<{
        full_name: string;
        mobile_number: string;
        whatsapp_number: string;
    }>;
    updateUser(id: string, fields: UpdateQuery<User>): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, User> & User & {
        _id: Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, User> & User & {
        _id: Types.ObjectId;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    deleteUser(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, User> & User & {
        _id: Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, User> & User & {
        _id: Types.ObjectId;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    changePassword({ id, changePasswordDto, }: {
        id: string;
        changePasswordDto: ChangePasswordDto;
    }): Promise<{
        message: string;
    }>;
    getUserPassword(user: UserDocument): string | null;
}
