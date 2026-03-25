import { Request, Response } from 'express';
import { mediaService } from './media.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { catchAsync } from '../../utils/catchAsync';
import { ApiError } from '@/utils/ApiError';
import { CreateMediaInput, MediaQuery } from './media.validator';

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
    const url = file.path;
    const publicId = file.fileName;
    const fileSize = Math.round(file.size / 1024);

    const media = await mediaService.create(req.body as CreateMediaInput, url, publicId, fileSize);

    ApiResponse.created(res, media, 'Media created successfully');
  }),

  updateByPatch: catchAsync(async (req: Request, res: Response) => {
    const uploadedFiles = (req as any).uploadedFiles as
      | { url: string; publicId: string }[]
      | undefined;

    const newImage = uploadedFiles?.[0];

    const media = await mediaService.updateByPatch(req.params.id, req.body, newImage);
    ApiResponse.success(res, media, 'Media updated successfully');
  }),

  // DELETE /media/:id  (admin)
  remove: catchAsync(async (req: Request, res: Response) => {
    await mediaService.softDelete(req.params.id);
    ApiResponse.success(res, null, 'A media image kept trash!');
  }),
  // DELETE /media/:id  (admin)
  restore: catchAsync(async (req: Request, res: Response) => {
    await mediaService.reStore(req.params.id);
    ApiResponse.success(res, null, 'A media image restored!');
  }),
  // Hard delete media

  delete: catchAsync(async (req: Request, res: Response) => {
    await mediaService.deleteMedia(req.params.id);
    ApiResponse.success(res, null, 'Media deleted');
  }),
};
