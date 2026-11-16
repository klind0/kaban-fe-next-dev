import { User } from "../../user/schemas/user.schema";
export type IJWTPayload = Pick<User, 'email' | 'role'> & {
    id: string;
    realtorId?: string;
};
