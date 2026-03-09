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

      if (error) throw error;
      set({ recipes: (data as unknown as Recipe[]) || [] });
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

      const dbRecipe = {
        ...recipeData,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('recipes')
        .insert([dbRecipe])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({ recipes: [data as unknown as Recipe, ...state.recipes] }));
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
      const { error } = await supabase
        .from('recipes')
        .update(updates)
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
