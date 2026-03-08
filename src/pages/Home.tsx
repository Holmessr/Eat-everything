import React, { useState } from 'react';
import { useShopStore } from '../stores/shopStore';
import { useRecipeStore } from '../stores/recipeStore';
import { Sparkles, Utensils, RefreshCw } from 'lucide-react';
import ShopCard from '../components/ShopCard';
import RecipeCard from '../components/RecipeCard';
import { Shop, Recipe } from '../types';

const Home: React.FC = () => {
  const { shops } = useShopStore();
  const { recipes } = useRecipeStore();
  const [recommendation, setRecommendation] = useState<{ type: 'shop' | 'recipe'; data: Shop | Recipe } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRecommend = () => {
    setIsAnimating(true);
    setRecommendation(null);
    
    // Simulate thinking/randomizing time
    setTimeout(() => {
      const allItems = [
        ...shops.map(s => ({ type: 'shop' as const, data: s })),
        ...recipes.map(r => ({ type: 'recipe' as const, data: r }))
      ];
      
      if (allItems.length > 0) {
        const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
        setRecommendation(randomItem);
      }
      setIsAnimating(false);
    }, 800);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2 mt-8">
        <h1 className="text-3xl font-bold text-gray-900">今天吃什么？</h1>
        <p className="text-gray-500">让 AI 为你做出完美的选择</p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleRecommend}
          disabled={isAnimating}
          className={`
            relative group flex items-center justify-center px-8 py-4 
            bg-gradient-to-r from-blue-600 to-purple-600 text-white 
            rounded-full shadow-lg hover:shadow-xl transition-all 
            disabled:opacity-80 disabled:cursor-not-allowed
            ${isAnimating ? 'scale-95' : 'hover:scale-105'}
          `}
        >
          <Sparkles className={`w-6 h-6 mr-2 ${isAnimating ? 'animate-spin' : ''}`} />
          <span className="text-lg font-bold">
            {isAnimating ? '正在思考...' : '帮我选一个'}
          </span>
        </button>
      </div>

      {recommendation && (
        <div className="animate-fade-in-up">
          <div className="flex items-center justify-center mb-4 space-x-2 text-gray-500">
            {recommendation.type === 'shop' ? <Utensils className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
            <span className="text-sm font-medium">
              为你推荐了 {recommendation.type === 'shop' ? '一家好店' : '一道美味'}
            </span>
          </div>
          
          <div className="transform transition-all hover:scale-[1.02]">
            {recommendation.type === 'shop' ? (
              <ShopCard shop={recommendation.data as Shop} />
            ) : (
              <RecipeCard recipe={recommendation.data as Recipe} />
            )}
          </div>
          
          <div className="flex justify-center mt-6 gap-4">
            <button 
              onClick={handleRecommend}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              换一个
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              就吃这个
            </button>
          </div>
        </div>
      )}
      
      {!recommendation && !isAnimating && (
        <div className="grid grid-cols-2 gap-4 mt-12">
           <div className="bg-blue-50 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">{shops.length}</div>
              <div className="text-sm text-blue-800">收藏店铺</div>
           </div>
           <div className="bg-green-50 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{recipes.length}</div>
              <div className="text-sm text-green-800">收藏菜谱</div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Home;
