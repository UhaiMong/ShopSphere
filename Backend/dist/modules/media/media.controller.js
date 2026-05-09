"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaController = void 0;
const media_service_1 = require("./media.service");
const ApiResponse_1 = require("../../utils/ApiResponse");
const catchAsync_1 = require("../../utils/catchAsync");
const ApiError_1 = require("../../utils/ApiError");
exports.mediaController = {
    // GET /media
    getAll: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { media, pagination } = await media_service_1.mediaService.getAll(req.query);
        ApiResponse_1.ApiResponse.paginated(res, media, pagination);
    }),
    // POST /media  (admin)
    create: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const uploadedFiles = req.uploadedFiles;
        const file = req.file;
        if (!uploadedFiles?.length) {
            throw ApiError_1.ApiError.badRequest('Image is required');
        }
        // Single image upload for media
        const fSize = Math.round(file.size / 1024);
        const { url, publicId, fileSize = fSize } = uploadedFiles[0];
        const media = await media_service_1.mediaService.create(req.body, url, publicId, fileSize);
        ApiResponse_1.ApiResponse.created(res, media, 'Media created successfully');
    }),
    // Upldate Media
    updateByPatch: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const uploadedFiles = req.uploadedFiles;
        const newImage = uploadedFiles?.[0];
        const media = await media_service_1.mediaService.updateByPatch(req.params.id, req.body, newImage);
        ApiResponse_1.ApiResponse.success(res, media, 'Media updated successfully');
    }),
    // DELETE /media/:id  (admin)
    remove: (0, catchAsync_1.catchAsync)(async (req, res) => {
        await media_service_1.mediaService.softDelete(req.params.id);
        ApiResponse_1.ApiResponse.success(res, null, 'A media image kept trash!');
    }),
    // DELETE /media/:id  (admin)
    restore: (0, catchAsync_1.catchAsync)(async (req, res) => {
        await media_service_1.mediaService.reStore(req.params.id);
        ApiResponse_1.ApiResponse.success(res, null, 'A media image restored!');
    }),
    // Hard delete media
    delete: (0, catchAsync_1.catchAsync)(async (req, res) => {
        await media_service_1.mediaService.deleteMedia(req.params.id);
        ApiResponse_1.ApiResponse.success(res, null, 'Media deleted');
    }),
};
//# sourceMappingURL=media.controller.js.map