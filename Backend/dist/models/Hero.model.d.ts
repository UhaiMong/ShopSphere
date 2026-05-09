import { Model } from 'mongoose';
export interface HeroSlide {
    _id: string;
    id: string;
    title: string;
    subtitle: string;
    offer?: string;
    ctaText: string;
    ctaLink: string;
    backgroundImage: string;
    isActive: boolean;
}
export declare const Hero: Model<HeroSlide>;
//# sourceMappingURL=Hero.model.d.ts.map