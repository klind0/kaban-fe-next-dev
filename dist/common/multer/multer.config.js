"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerConfig = exports.MAX_UPLOAD_FILE_SIZE_BYTES = exports.MAX_LISTING_IMAGES = void 0;
const multer_1 = require("multer");
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
exports.MAX_LISTING_IMAGES = 5;
exports.MAX_UPLOAD_FILE_SIZE_BYTES = 5 * 1024 * 1024;
exports.multerConfig = {
    storage: (0, multer_1.memoryStorage)(),
    limits: {
        fileSize: exports.MAX_UPLOAD_FILE_SIZE_BYTES,
        files: exports.MAX_LISTING_IMAGES,
    },
    fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            return cb(null, false);
        }
        cb(null, true);
    },
};
//# sourceMappingURL=multer.config.js.map