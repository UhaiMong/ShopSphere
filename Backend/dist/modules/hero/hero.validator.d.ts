import { z } from 'zod';
export declare const createHeroSchema: z.ZodObject<{
    title: z.ZodString;
    subtitle: z.ZodString;
    offer: z.ZodOptional<z.ZodString>;
    ctaText: z.ZodOptional<z.ZodString>;
    ctaLink: z.ZodString;
    backgroundImage: z.ZodString;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive: boolean;
    title: string;
    subtitle: string;
    ctaLink: string;
    backgroundImage: string;
    offer?: string | undefined;
    ctaText?: string | undefined;
}, {
    title: string;
    subtitle: string;
    ctaLink: string;
    backgroundImage: string;
    isActive?: boolean | undefined;
    offer?: string | undefined;
    ctaText?: string | undefined;
}>;
export declare const updageHeroSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    subtitle: z.ZodOptional<z.ZodString>;
    offer: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    ctaText: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    ctaLink: z.ZodOptional<z.ZodString>;
    backgroundImage: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    title?: string | undefined;
    subtitle?: string | undefined;
    offer?: string | undefined;
    ctaText?: string | undefined;
    ctaLink?: string | undefined;
    backgroundImage?: string | undefined;
}, {
    isActive?: boolean | undefined;
    title?: string | undefined;
    subtitle?: string | undefined;
    offer?: string | undefined;
    ctaText?: string | undefined;
    ctaLink?: string | undefined;
    backgroundImage?: string | undefined;
}>;
export type CreateHeroInput = z.infer<typeof createHeroSchema>;
export type UpdateHeroInput = z.infer<typeof updageHeroSchema>;
//# sourceMappingURL=hero.validator.d.ts.map