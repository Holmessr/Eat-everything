import React from 'react';
import { Recipe } from '../types';
import { Star, Clock, ChefHat } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const difficultyColor = {
    easy: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    hard: 'text-red-600 bg-red-50',
  };

  const difficultyLabel = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
      <div className="relative h-48 bg-gray-200">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No Image
          </div>
        )}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium ${difficultyColor[recipe.difficulty]}`}>
          {difficultyLabel[recipe.difficulty]}
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 truncate">{recipe.name}</h3>
          <div className="flex items-center text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="ml-1 text-sm font-medium">{recipe.rating}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center text-gray-500 text-xs space-x-4">
            <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                <span>{recipe.prepTime + recipe.cookTime} 分钟</span>
            </div>
            <div className="flex items-center">
                <ChefHat className="w-3 h-3 mr-1" />
                <span>{recipe.ingredients.length} 种食材</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
