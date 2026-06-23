import type { Request, Response } from 'express';
import { mediaService } from './media.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { catchAsync } from '../../utils/catchAsync';
import { ApiError } from '../../utils/ApiError';
import type { CreateMediaInput, MediaQuery } from './media.validator';

export const mediaController = {
  // GET /media
  getAll: catchAsync(async (req: Request, res: Response) => {
    const { media, pagination } = await mediaService.getAll(req.query as unknown as MediaQuery);
    ApiResponse.paginated(res, media, pagination);
  }),

  // POST /media  (admin)
  create: catchAsync(async (req: Request, res: Response) => {
    const uploadedFiles = (req as any).uploadedFiles as {
      url: string;
      publicId: string;
      fileSize: number;
    }[];

    const file = req.file as any;

    if (!uploadedFiles?.length) {
      throw ApiError.badRequest('Image is required');
    }

    // Single image upload for media
    const fSize = Math.round(file.size / 1024);
    const { url, publicId, fileSize = fSize } = uploadedFiles[0]!;
    const media = await mediaService.create(req.body as CreateMediaInput, url, publicId, fileSize);

    ApiResponse.created(res, media, 'Media created successfully');
  }),

  // Upldate Media

  updateByPatch: catchAsync(async (req: Request, res: Response) => {
    const uploadedFiles = (req as any).uploadedFiles as {
      url: string;
      publicId: string;
      fileSize: number;
    }[];

    const newImage = uploadedFiles?.[0];
    const mediaId = req.params.id;
    if (!mediaId) throw ApiError.badRequest('Media id is missing');
    const media = await mediaService.updateByPatch(mediaId, req.body, newImage);

    ApiResponse.success(res, media, 'Media updated successfully');
  }),

  // DELETE /media/:id  (admin)
  remove: catchAsync(async (req: Request, res: Response) => {
    const mediaId = req.params.id;
    if (!mediaId) throw ApiError.badRequest('Media id is missing');
    await mediaService.softDelete(mediaId);
    ApiResponse.success(res, null, 'A media image kept trash!');
  }),
  // DELETE /media/:id  (admin)
  restore: catchAsync(async (req: Request, res: Response) => {
    const mediaId = req.params.id;
    if (!mediaId) throw ApiError.badRequest('Media id is missing');
    await mediaService.reStore(mediaId);
    ApiResponse.success(res, null, 'A media image restored!');
  }),

  // Hard delete media
  delete: catchAsync(async (req: Request, res: Response) => {
    const mediaId = req.params.id;
    if (!mediaId) throw ApiError.badRequest('Media id is missing');
    await mediaService.deleteMedia(mediaId);
    ApiResponse.success(res, null, 'Media deleted');
  }),
};
