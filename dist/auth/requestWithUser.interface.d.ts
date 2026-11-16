import { Request } from 'express';
import { IJWTPayload } from "../utils/interfaces/jwt.interface";
interface RequestWithUser extends Request {
    user: IJWTPayload;
}
export default RequestWithUser;
