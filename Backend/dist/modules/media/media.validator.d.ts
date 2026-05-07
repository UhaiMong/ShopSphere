import { z } from 'zod';
export declare const createMediaSchema: z.ZodObject<{
    title: z.ZodString;
    alt: z.ZodString;
    category: z.ZodString;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive: boolean;
    category: string;
    title: string;
    alt: string;
}, {
    category: string;
    title: string;
    alt: string;
    isActive?: boolean | undefined;
}>;
export declare const updatMediaSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    alt: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    category?: string | undefined;
    title?: string | undefined;
    alt?: string | undefined;
}, {
    isActive?: boolean | undefined;
    category?: string | undefined;
    title?: string | undefined;
    alt?: string | undefined;
}>;
export declare const mediaQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    category: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    search?: string | undefined;
    category?: string | undefined;
}, {
    search?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    category?: string | undefined;
}>;
export declare const singleMediaQuerySchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    category?: string | undefined;
    title?: string | undefined;
}, {
    category?: string | undefined;
    title?: string | undefined;
}>;
export type CreateMediaInput = z.infer<typeof createMediaSchema>;
export type UpdateMediaInput = z.infer<typeof updatMediaSchema>;
export type MediaQuery = z.infer<typeof mediaQuerySchema>;
export type MediaQuerySingle = z.infer<typeof singleMediaQuerySchema>;
//# sourceMappingURL=media.validator.d.ts.map