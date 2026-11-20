import { VERIFICATION_STATUS } from '../schemas/realtor.schema';
export declare class RealtorResponseDto {
    id: string;
    realtor_pic: string | null;
    is_founding_realtor: boolean;
    bio: string | null;
    company: string | null;
    office_address: string | null;
    service_area: string | null;
    mobile_number: string | null;
    whatsapp_number: string | null;
    socials: Record<string, string> | null;
    rating: number;
    verification_status: VERIFICATION_STATUS;
}
