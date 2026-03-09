export type ShopType = 'delivery' | 'dine-in';

export interface Shop {
  id: string;
  name: string;
  type: ShopType;
  rating: number; // 1-5
  tags: string[];
  imageUrl?: string;
  images?: string[]; // Multiple images support
  visitCount: number;
  lastVisited?: string; // ISO date string
  description?: string;
  address?: string;
  platform?: 'meituan' | 'eleme' | 'taobao' | 'other';
  platformLink?: string;
}

export type RecipeDifficulty = 'easy' | 'medium' | 'hard';

export interface Recipe {
  id: string;
  name: string;
  rating: number;
  tags: string[];
  imageUrl?: string;
  images?: string[]; // Multiple images support
  difficulty: RecipeDifficulty;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  ingredients: string[];
  steps: string[];
  sourceUrl?: string; // e.g., Xiaohongshu link
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  preferences?: {
    spicy: number; // 0-5
    sweet: number; // 0-5
    salty: number; // 0-5
    avoidIngredients: string[];
  };
}
