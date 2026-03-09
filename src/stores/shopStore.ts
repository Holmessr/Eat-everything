import { create } from 'zustand';
import { Shop } from '../types';
import { supabase } from '../lib/supabase';

interface ShopState {
  shops: Shop[];
  loading: boolean;
  error: string | null;
  fetchShops: () => Promise<void>;
  addShop: (shop: Omit<Shop, 'id' | 'user_id'>) => Promise<void>;
  removeShop: (id: string) => Promise<void>;
  updateShop: (id: string, updates: Partial<Shop>) => Promise<void>;
}

export const useShopStore = create<ShopState>((set, get) => ({
  shops: [],
  loading: false,
  error: null,

  fetchShops: async () => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ shops: [], loading: false });
        return;
      }

      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ shops: (data as unknown as Shop[]) || [] });
    } catch (err: any) {
      set({ error: err.message });
      console.error('Fetch shops error:', err);
    } finally {
      set({ loading: false });
    }
  },

  addShop: async (shopData) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const dbShop = {
        ...shopData,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('shops')
        .insert([dbShop])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({ shops: [data as unknown as Shop, ...state.shops] }));
    } catch (err: any) {
      console.error('Add shop error:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  removeShop: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('shops').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ shops: state.shops.filter((s) => s.id !== id) }));
    } catch (err: any) {
      console.error('Delete shop error:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  updateShop: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('shops')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        shops: state.shops.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      }));
    } catch (err: any) {
      console.error('Update shop error:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));
