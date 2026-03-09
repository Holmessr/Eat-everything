import { create } from 'zustand';
import { Recipe } from '../types';
import { supabase } from '../lib/supabase';

interface RecipeState {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  fetchRecipes: () => Promise<void>;
  addRecipe: (recipe: Omit<Recipe, 'id' | 'user_id'>) => Promise<void>;
  removeRecipe: (id: string) => Promise<void>;
  updateRecipe: (id: string, updates: Partial<Recipe>) => Promise<void>;
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [],
  loading: false,
  error: null,

  fetchRecipes: async () => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ recipes: [], loading: false });
        return;
      }

      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      // Map DB snake_case to frontend camelCase
      const mappedRecipes = (data || []).map((r: any) => ({
        ...r,
        prepTime: r.prep_time,
        cookTime: r.cook_time,
        imageUrl: r.image_url,
        sourceUrl: r.source_url,
      }));
      set({ recipes: mappedRecipes as Recipe[] });
    } catch (err: any) {
      set({ error: err.message });
      console.error('Fetch recipes error:', err);
    } finally {
      set({ loading: false });
    }
  },

  addRecipe: async (recipeData) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Map frontend camelCase to DB snake_case
      const dbRecipe = {
        user_id: user.id,
        name: recipeData.name,
        rating: recipeData.rating,
        tags: recipeData.tags,
        difficulty: recipeData.difficulty,
        prep_time: recipeData.prepTime, // Map prepTime to prep_time
        cook_time: recipeData.cookTime, // Map cookTime to cook_time
        ingredients: recipeData.ingredients,
        steps: recipeData.steps,
        image_url: recipeData.imageUrl, // Map imageUrl to image_url
        images: recipeData.images,
        source_url: recipeData.sourceUrl, // Map sourceUrl to source_url
      };

      const { data, error } = await supabase
        .from('recipes')
        .insert([dbRecipe])
        .select()
        .single();

      if (error) throw error;

      // Map DB snake_case back to frontend camelCase for the new item
      const newRecipe: Recipe = {
        ...data,
        prepTime: data.prep_time,
        cookTime: data.cook_time,
        imageUrl: data.image_url,
        sourceUrl: data.source_url,
      };

      set((state) => ({ recipes: [newRecipe, ...state.recipes] }));
    } catch (err: any) {
      console.error('Add recipe error:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  removeRecipe: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('recipes').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ recipes: state.recipes.filter((r) => r.id !== id) }));
    } catch (err: any) {
      console.error('Delete recipe error:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  updateRecipe: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      // Map frontend updates to DB snake_case
      const dbUpdates: any = { ...updates };
      if (updates.prepTime !== undefined) {
        dbUpdates.prep_time = updates.prepTime;
        delete dbUpdates.prepTime;
      }
      if (updates.cookTime !== undefined) {
        dbUpdates.cook_time = updates.cookTime;
        delete dbUpdates.cookTime;
      }
      if (updates.imageUrl !== undefined) {
        dbUpdates.image_url = updates.imageUrl;
        delete dbUpdates.imageUrl;
      }
      if (updates.sourceUrl !== undefined) {
        dbUpdates.source_url = updates.sourceUrl;
        delete dbUpdates.sourceUrl;
      }

      const { error } = await supabase
        .from('recipes')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        recipes: state.recipes.map((r) => (r.id === id ? { ...r, ...updates } : r)),
      }));
    } catch (err: any) {
      console.error('Update recipe error:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));
