import { RealtorResponseDto } from "../../realtor/dto/realtor-response.dto";
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class AuthResponse {
    accessToken: string;
    email: string;
    fullName: string;
    realtor: RealtorResponseDto | null;
}
