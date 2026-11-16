import { v2 as cloudinary } from 'cloudinary';
export declare class CloudinaryService {
    private readonly cloudinaryInstance;
    private readonly logger;
    constructor(cloudinaryInstance: typeof cloudinary);
    uploadImages(files: Express.Multer.File[], options?: {
        folder?: string;
        publicIdPrefix?: string;
    }): Promise<{
        url: string;
        publicId: string;
    }[]>;
    deleteImage(publicId: string): Promise<void>;
}
