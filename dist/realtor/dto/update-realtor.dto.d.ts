import { KYC } from '../schemas/kyc.schema';
import { VERIFICATION_STATUS } from '../schemas/realtor.schema';
export declare class UpdateRealtorDto {
    full_name?: string;
    realtor_pic?: string;
    is_founding_realtor?: boolean;
    bio?: string;
    company?: string;
    office_address?: string;
    service_area?: string;
    mobile_number?: string;
    whatsapp_number?: string;
    socials?: string;
    kyc?: Partial<KYC>;
    verification_status?: VERIFICATION_STATUS;
}
