export type ShopType = 'delivery' | 'dine-in';

export interface Shop {
  id: string;
  name: string;
  type: ShopType;
  rating: number; // 1-5
  tags: string[];
  image_url?: string; // snake_case
  images?: string[]; // Multiple images support
  visit_count: number; // snake_case
  last_visited?: string; // ISO date string, snake_case
  description?: string;
  address?: string;
  platform?: 'meituan' | 'eleme' | 'taobao' | 'other';
  platform_link?: string; // snake_case
}

export type RecipeDifficulty = 'easy' | 'medium' | 'hard';

export interface Recipe {
  id: string;
  name: string;
  rating: number;
  tags: string[];
  image_url?: string; // snake_case
  images?: string[]; // Multiple images support
  difficulty: RecipeDifficulty;
  prep_time: number; // in minutes, snake_case
  cook_time: number; // in minutes, snake_case
  ingredients: string[];
  steps: string[];
  source_url?: string; // e.g., Xiaohongshu link, snake_case
}

export interface UserProfile {
  id: string;
  name: string;
  avatar_url?: string; // snake_case
  bio?: string;
  preferences?: {
    spicy: number; // 0-5
    sweet: number; // 0-5
    salty: number; // 0-5
    avoidIngredients: string[];
  };
}
