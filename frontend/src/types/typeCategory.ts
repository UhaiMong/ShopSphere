//  Category
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parent?: string | null;
  ancestors: string[];
  isActive: boolean;
  sortOrder: number;
}
