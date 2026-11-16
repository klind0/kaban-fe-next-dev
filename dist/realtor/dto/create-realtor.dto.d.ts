import { Types } from 'mongoose';
import { KYC } from '../schemas/kyc.schema';
export declare class CreateRealtorDto {
    user: Types.ObjectId;
    realtor_pic?: string;
    bio?: string;
    company?: string;
    office_address?: string;
    service_area?: string;
    mobile_number?: string;
    whatsapp_number?: string;
    socials?: string;
    kyc?: KYC;
}
