import { Hero, HeroSlide } from '@/models/Hero.model';
import { ApiError } from '@/utils/ApiError';
import { CreateHeroInput, UpdateHeroInput } from './hero.validator';

export const heroService = {
  // get all active slides
  async getActivedSlides(): Promise<HeroSlide[]> {
    const heroes = await Hero.find({ isActive: true });
    if (!heroes || heroes.length === 0) throw ApiError.notFound('Active Hero Slides');
    return heroes.map((h) => h.toObject() as HeroSlide);
  },

  // get all slides (admin dashboard)
  async getAllSlides(): Promise<HeroSlide[]> {
    const heroes = await Hero.find();
    if (!heroes || heroes.length === 0) throw ApiError.notFound('Hero Slides');
    return heroes.map((h) => h.toObject() as HeroSlide);
  },

  // create
  async create(data: CreateHeroInput): Promise<HeroSlide> {
    const hero = await Hero.create(data);
    return hero.toObject() as HeroSlide;
  },

  // update
  async update(id: string, data: Partial<UpdateHeroInput>): Promise<HeroSlide> {
    const hero = await Hero.findByIdAndUpdate(id, data, { new: true });
    if (!hero) throw ApiError.notFound('Hero');
    return hero.toObject() as HeroSlide;
  },

  // soft delete (set isActive: false)
  async softDelete(id: string): Promise<HeroSlide> {
    const hero = await Hero.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!hero) throw ApiError.notFound('Hero');
    return hero.toObject() as HeroSlide;
  },

  // permanent delete
  async delete(id: string): Promise<HeroSlide> {
    const hero = await Hero.findByIdAndDelete(id);
    if (!hero) throw ApiError.notFound('Hero');
    return hero.toObject() as HeroSlide;
  },
};
