import { Request, Response, NextFunction } from "express";
import { UserRole } from "../types";
export declare const protect: (req: Request, _res: Response, next: NextFunction) => void;
export declare const requireRole: (...roles: UserRole[]) => (req: Request, _res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map