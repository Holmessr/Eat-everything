import { create } from 'zustand';
import { Shop } from '../types';

interface ShopState {
  shops: Shop[];
  addShop: (shop: Shop) => void;
  removeShop: (id: string) => void;
  updateShop: (id: string, updates: Partial<Shop>) => void;
  setShops: (shops: Shop[]) => void;
}

const mockShops: Shop[] = [
  {
    id: '1',
    name: '麦当劳 (科技园店)',
    type: 'delivery',
    rating: 4.5,
    tags: ['快餐', '汉堡', '炸鸡'],
    visitCount: 12,
    lastVisited: '2023-10-25T12:00:00Z',
    platform: 'meituan',
    imageUrl: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&q=80&w=300&h=200'
  },
  {
    id: '2',
    name: '海底捞火锅',
    type: 'dine-in',
    rating: 4.8,
    tags: ['火锅', '聚餐', '服务好'],
    visitCount: 5,
    lastVisited: '2023-10-20T19:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&q=80&w=300&h=200'
  },
  {
    id: '3',
    name: '沙县小吃',
    type: 'dine-in',
    rating: 3.8,
    tags: ['快餐', '便宜', '面食'],
    visitCount: 20,
    lastVisited: '2023-10-26T12:30:00Z'
  }
];

export const useShopStore = create<ShopState>((set) => ({
  shops: mockShops,
  addShop: (shop) => set((state) => ({ shops: [...state.shops, shop] })),
  removeShop: (id) => set((state) => ({ shops: state.shops.filter((s) => s.id !== id) })),
  updateShop: (id, updates) =>
    set((state) => ({
      shops: state.shops.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),
  setShops: (shops) => set({ shops }),
}));
