import { Request, Response } from 'express';
import { ApiResponse } from '../../utils/ApiResponse';
import { catchAsync } from '../../utils/catchAsync';
import { heroService } from './hero.service';

export const heroController = {
  // GET /hero/active
  getActived: catchAsync(async (_req: Request, res: Response) => {
    const heroes = await heroService.getActivedSlides();
    ApiResponse.success(res, heroes);
  }),

  // GET /hero/all (admin)
  getAll: catchAsync(async (_req: Request, res: Response) => {
    const heroes = await heroService.getAllSlides();
    ApiResponse.success(res, heroes);
  }),

  // POST /hero (admin)
  create: catchAsync(async (req: Request, res: Response) => {
    const hero = await heroService.create(req.body);
    ApiResponse.created(res, hero, 'Hero created successfully');
  }),

  // PATCH /hero/:id (admin)
  updateHero: catchAsync(async (req: Request, res: Response) => {
    const updated = await heroService.update(req.params.id, req.body);
    ApiResponse.success(res, updated, 'Hero updated successfully');
  }),

  // DELETE /hero/:id (soft delete, admin)
  softDelete: catchAsync(async (req: Request, res: Response) => {
    const hero = await heroService.softDelete(req.params.id);
    ApiResponse.success(res, hero, 'Hero soft deleted successfully');
  }),

  // DELETE /hero/:id/permanent (hard delete, admin)
  deleteHero: catchAsync(async (req: Request, res: Response) => {
    const hero = await heroService.delete(req.params.id);
    ApiResponse.success(res, hero, 'Hero permanently deleted');
  }),
};
