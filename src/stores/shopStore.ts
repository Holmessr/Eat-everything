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

      // Map DB snake_case to frontend camelCase
      const mappedShops = (data || []).map((s: any) => ({
        ...s,
        imageUrl: s.image_url,
        visitCount: s.visit_count,
      }));
      set({ shops: mappedShops as Shop[] });
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

      // Map frontend camelCase to DB snake_case
      const dbShop = {
        user_id: user.id,
        name: shopData.name,
        type: shopData.type,
        rating: shopData.rating,
        tags: shopData.tags,
        image_url: shopData.imageUrl, // Map imageUrl to image_url
        images: shopData.images,
        visit_count: shopData.visitCount, // Map visitCount to visit_count
        address: shopData.address,
        description: shopData.description,
      };

      const { data, error } = await supabase
        .from('shops')
        .insert([dbShop])
        .select()
        .single();

      if (error) throw error;

      // Map DB snake_case back to frontend camelCase for the new item
      const newShop: Shop = {
        ...data,
        imageUrl: data.image_url,
        visitCount: data.visit_count,
      };

      set((state) => ({ shops: [newShop, ...state.shops] }));
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
      // Map frontend updates to DB snake_case
      const dbUpdates: any = { ...updates };
      if (updates.imageUrl !== undefined) {
        dbUpdates.image_url = updates.imageUrl;
        delete dbUpdates.imageUrl;
      }
      if (updates.visitCount !== undefined) {
        dbUpdates.visit_count = updates.visitCount;
        delete dbUpdates.visitCount;
      }

      const { error } = await supabase
        .from('shops')
        .update(dbUpdates)
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
