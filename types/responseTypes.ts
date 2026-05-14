export type ErrorResponse = {
  level: string;
  message: string;
  name: string;
  options: object;
  response: {
    message: string | string[];
    error: string;
    statusCode: number;
  };
  service: string;
  status: number;
  timestamp: string;
};

export type SuccessResponse<T> = {
  data: T;
};

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}
