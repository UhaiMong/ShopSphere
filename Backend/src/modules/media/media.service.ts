import mongoose, { FilterQuery } from 'mongoose';
import { Category } from '../../models/Category.model';
import { ApiError } from '../../utils/ApiError';
import { getPaginationMeta, PaginationMeta } from '../../utils/ApiResponse';
import { cloudinary } from '../../config/cloudinary';
import { CreateMediaInput, MediaQuery, UpdateMediaInput } from './media.validator';
import { IMedia, Media } from '@/models/Media.model';

export const mediaService = {
  // getAll
  async getAll(query: MediaQuery): Promise<{
    media: IMedia[];
    pagination: PaginationMeta;
  }> {
    const { page, limit, category } = query;

    const filter: FilterQuery<MediaQuery> = {};

    if (category) {
      const cat = await Category.findOne({
        $or: [{ _id: mongoose.isValidObjectId(category) ? category : null }],
      });
      if (cat) {
        filter.category = {
          $in: await Category.find({
            $or: [{ _id: cat._id }, { ancestors: cat._id }],
          }).distinct('_id'),
        };
      }
    }

    // Full-text search using MongoDB text index

    const skip = (page - 1) * limit;

    const [media, total] = await Promise.all([
      Media.find(filter).populate('category', 'title').skip(skip).limit(limit).lean<IMedia[]>(),
      Media.countDocuments(filter),
    ]);

    return {
      media,
      pagination: getPaginationMeta(total, page, limit),
    };
  },

  // getById
  async getById(id: string): Promise<IMedia> {
    const isObjectId = mongoose.isValidObjectId(id);
    const filter: FilterQuery<MediaQuery> = isObjectId ? { _id: id } : { _id: id };

    const media = await Media.findOne(filter).populate('category', 'title').lean<IMedia>();

    if (!media) throw ApiError.notFound('Media');
    return media;
  },

  // create
  async create(
    data: CreateMediaInput,
    imgURL: string,
    publicId: string,
    fileSize: number,
  ): Promise<IMedia> {
    const category = await Category.findById(data.category);
    if (!category) throw ApiError.notFound('Category');

    const media = await Media.create({
      ...data,
      imgURL,
      publicId,
      fileSize,
    });

    return media.toObject() as IMedia;
  },

  // upldate by patch
  async updateByPatch(
    id: string,
    data: UpdateMediaInput,
    newImage?: { url: string; publicId: string },
  ): Promise<IMedia> {
    const media = await Media.findById(id);
    if (!media) throw ApiError.notFound('Media');

    if (data.category) {
      const category = await Category.findById(data.category); // ← was Media.findById
      if (!category) throw ApiError.notFound('Category');
    }

    if (newImage) {
      // Delete old image from Cloudinary before replacing
      if (media.publicId) {
        await cloudinary.uploader.destroy(media.publicId);
      }
      media.imgURL = newImage.url;
      media.publicId = newImage.publicId;
    }

    Object.assign(media, data);
    await media.save();
    return media.toObject() as IMedia;
  },
  // softDelete
  async softDelete(id: string): Promise<void> {
    const media = await Media.findByIdAndUpdate(id, { isActive: false });
    if (!media) throw ApiError.notFound('Media');
  },

  // Delete media
  async deleteMedia(mediaId: string): Promise<void> {
    const media = await Media.findById(mediaId);
    if (!media) throw ApiError.notFound('Media');

    // Cloudinary public_id is already stored — use it directly
    const publicId = media.publicId;

    // Delete from Cloudinary first; if it fails, DB stays intact
    const cloudResult = await cloudinary.uploader.destroy(publicId);
    if (cloudResult.result !== 'ok' && cloudResult.result !== 'not found') {
      throw ApiError.badRequest(`Cloudinary deletion failed: ${cloudResult.result}`);
    }

    await media.deleteOne();
  },
};
