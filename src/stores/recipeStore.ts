import { create } from 'zustand';
import { Recipe } from '../types';

interface RecipeState {
  recipes: Recipe[];
  addRecipe: (recipe: Recipe) => void;
  removeRecipe: (id: string) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  setRecipes: (recipes: Recipe[]) => void;
}

const mockRecipes: Recipe[] = [
  {
    id: '1',
    name: '番茄炒蛋',
    rating: 4.8,
    tags: ['家常菜', '快手菜', '下饭'],
    difficulty: 'easy',
    prepTime: 5,
    cookTime: 5,
    ingredients: ['鸡蛋 3个', '番茄 2个', '葱花 适量', '盐 1勺', '糖 1勺'],
    steps: ['番茄切块，鸡蛋打散', '热锅凉油炒熟鸡蛋盛出', '锅中留底油炒番茄出汁', '加入鸡蛋翻炒', '调味出锅'],
    imageUrl: 'https://images.unsplash.com/photo-1619860645938-f9b7c89309c4?auto=format&fit=crop&q=80&w=300&h=200'
  },
  {
    id: '2',
    name: '红烧肉',
    rating: 5.0,
    tags: ['硬菜', '猪肉', '传统'],
    difficulty: 'hard',
    prepTime: 20,
    cookTime: 90,
    ingredients: ['五花肉 500g', '冰糖 30g', '姜片 5片', '八角 2个', '生抽 2勺', '老抽 1勺'],
    steps: ['五花肉焯水洗净', '炒糖色', '加入肉块翻炒上色', '加入调料和开水炖煮', '大火收汁'],
    imageUrl: 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?auto=format&fit=crop&q=80&w=300&h=200'
  }
];

export const useRecipeStore = create<RecipeState>((set) => ({
  recipes: mockRecipes,
  addRecipe: (recipe) => set((state) => ({ recipes: [...state.recipes, recipe] })),
  removeRecipe: (id) => set((state) => ({ recipes: state.recipes.filter((r) => r.id !== id) })),
  updateRecipe: (id, updates) =>
    set((state) => ({
      recipes: state.recipes.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),
  setRecipes: (recipes) => set({ recipes }),
}));
