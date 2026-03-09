import { create } from 'zustand';
import { UserProfile } from '../types';

interface UserState {
  profile: UserProfile;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: {
    id: '1',
    name: '美食家',
    avatarUrl: '',
    bio: '今天吃什么？这是个问题。',
    preferences: {
      spicy: 3,
      sweet: 3,
      salty: 3,
      avoidIngredients: [],
    },
  },
  updateProfile: (newProfile) =>
    set((state) => ({
      profile: { ...state.profile, ...newProfile },
    })),
}));
