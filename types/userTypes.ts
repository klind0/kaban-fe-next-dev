export interface IKYC {
  government_id?: string;
  realtor_certification?: string;
}

export enum VerificationStatus {
  NOT_VERIFIED = "NOT_VERIFIED",
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
}

export interface IRealtor {
  id: string;
  realtor_pic?: string;
  bio?: string;
  company?: string;
  office_address?: string;
  service_area?: string;
  mobile_number?: string;
  whatsapp_number?: string;
  socials?: Record<string, string>;
  kyc?: IKYC;
  rating: number;
  verification_status: VerificationStatus;
}

export enum UserRole {
  GUEST = "GUEST",
  AGENT = "AGENT",
  AGENCY = "AGENCY",
  ADMIN = "ADMIN",
}

export interface IUser {
  id: string;
  email: string;
  fullName: string;
  role: number;
  realtor?: IRealtor;
  mobileNumber?: string;  
  whatsappNumber?: string; 
  avatar?: string;
}
