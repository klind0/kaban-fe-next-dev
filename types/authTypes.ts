import { IRealtor, UserRole } from "./userTypes";

export interface ILoginResponse {
  login: {
    accessToken: string;
    user: {
      id: string;
      email: string;
      fullName: string;
      role: number;
    };
    realtor: IRealtor | null;
  };
}

export interface ILoginVariables {
  email: string;
  password: string;
}
export interface ISignUpVariables {
  input: {
    full_name: string;
    email: string;
    password: string;
    role: number;
  };
}

export interface ISignUpResponse {
  signup: {
    accessToken: string;
    user: {
      id: string;
      email: string;
      fullName: string;
      role: number;
    };
    realtor: IRealtor | null;
  };
}

export interface ILoginWithGoogleVariables {
  idToken: string;
}

export interface ILoginWithGoogleResponse {
  loginWithGoogle: {
    accessToken: string;
    user: {
      id: string;
      email: string;
      fullName: string;
      role: number;
    };
    realtor: IRealtor | null;
  };
}
