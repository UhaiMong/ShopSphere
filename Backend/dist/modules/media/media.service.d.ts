import { PaginationMeta } from '../../utils/ApiResponse';
import { CreateMediaInput, MediaQuery, UpdateMediaInput } from './media.validator';
import { IMedia } from '@/models/Media.model';
export declare const mediaService: {
    getAll(query: MediaQuery): Promise<{
        media: IMedia[];
        pagination: PaginationMeta;
    }>;
    create(data: CreateMediaInput, imgURL: string, publicId: string, fileSize: number): Promise<IMedia>;
    updateByPatch(id: string, data: UpdateMediaInput, newImage?: {
        url: string;
        publicId: string;
        fileSize: number;
    }): Promise<IMedia>;
    softDelete(id: string): Promise<void>;
    reStore(id: string): Promise<void>;
    deleteMedia(mediaId: string): Promise<void>;
};
//# sourceMappingURL=media.service.d.ts.map