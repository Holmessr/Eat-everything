import React, { useState } from 'react';
import { useRecipeStore } from '../stores/recipeStore';
import RecipeCard from '../components/RecipeCard';
import { Plus, Search, Filter } from 'lucide-react';

const Recipes: React.FC = () => {
  const { recipes } = useRecipeStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecipes = recipes.filter((recipe) => {
    return recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">菜谱大全</h1>
          <p className="text-sm text-gray-500 mt-1">收藏和整理你的 {recipes.length} 道专属菜谱</p>
        </div>
        <button className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          添加菜谱
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="搜索菜谱名称、食材或标签..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Recipe List */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
          <div className="bg-gray-100 p-4 rounded-full mb-4">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">没有找到菜谱</h3>
          <p className="mt-1">尝试调整搜索词</p>
        </div>
      )}
    </div>
  );
};

export default Recipes;
