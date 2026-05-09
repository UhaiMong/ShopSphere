import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
export declare const upload: multer.Multer;
export declare const processImages: (folder?: string) => (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=upload.middleware.d.ts.map