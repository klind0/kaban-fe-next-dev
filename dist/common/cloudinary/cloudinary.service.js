"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CloudinaryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
let CloudinaryService = CloudinaryService_1 = class CloudinaryService {
    cloudinaryInstance;
    logger = new common_1.Logger(CloudinaryService_1.name);
    constructor(cloudinaryInstance) {
        this.cloudinaryInstance = cloudinaryInstance;
    }
    async uploadImages(files, options = { folder: 'kaban/listings' }) {
        const uploads = files.map((file, index) => {
            const publicId = options.publicIdPrefix
                ? `${options.publicIdPrefix}_${Date.now()}_${index}`
                : `${Date.now()}_${index}`;
            return new Promise((resolve, reject) => {
                this.cloudinaryInstance.uploader
                    .upload_stream({
                    folder: options.folder,
                    public_id: publicId,
                    resource_type: 'image',
                }, (error, result) => {
                    if (error || !result)
                        return reject(error ?? new Error('No result'));
                    resolve(result);
                })
                    .end(file.buffer);
            });
        });
        const results = await Promise.allSettled(uploads);
        const succeeded = results
            .filter((result) => result.status === 'fulfilled')
            .map((result) => result.value);
        if (succeeded.length !== results.length) {
            const cleanupResults = await Promise.allSettled(succeeded.map((image) => this.deleteImage(image.public_id)));
            cleanupResults.forEach((result) => {
                if (result.status === 'rejected') {
                    this.logger.error('Failed to clean up a partially uploaded Cloudinary image', result.reason instanceof Error
                        ? result.reason.stack
                        : String(result.reason));
                }
            });
            const failedUpload = results.find((result) => result.status === 'rejected');
            this.logger.error('Cloudinary image upload failed', failedUpload?.reason instanceof Error
                ? failedUpload.reason.stack
                : String(failedUpload?.reason));
            throw new common_1.InternalServerErrorException('Failed to upload image(s) to Cloudinary');
        }
        return succeeded.map((image) => ({
            url: image.secure_url,
            publicId: image.public_id,
        }));
    }
    async deleteImage(publicId) {
        await this.cloudinaryInstance.uploader.destroy(publicId);
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = CloudinaryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('CLOUDINARY')),
    __metadata("design:paramtypes", [Object])
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map