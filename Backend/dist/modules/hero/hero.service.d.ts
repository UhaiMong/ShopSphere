import { HeroSlide } from '../../models/Hero.model';
import { CreateHeroInput, UpdateHeroInput } from './hero.validator';
export declare const heroService: {
    getActivedSlides(): Promise<HeroSlide[]>;
    getAllSlides(): Promise<HeroSlide[]>;
    create(data: CreateHeroInput): Promise<HeroSlide>;
    update(id: string, data: Partial<UpdateHeroInput>): Promise<HeroSlide>;
    softDelete(id: string): Promise<HeroSlide>;
    delete(id: string): Promise<HeroSlide>;
};
//# sourceMappingURL=hero.service.d.ts.map