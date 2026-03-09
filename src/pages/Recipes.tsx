import React, { useState, useEffect } from 'react';
import { useRecipeStore } from '../stores/recipeStore';
import RecipeCard from '../components/RecipeCard';
import AddRecipeModal from '../components/AddRecipeModal';
import { Plus, Search, Filter, Loader2 } from 'lucide-react';
import { Recipe } from '../types';
import { useTranslation } from 'react-i18next';

const Recipes: React.FC = () => {
  const { t } = useTranslation();
  const { recipes, removeRecipe, fetchRecipes, loading } = useRecipeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const filteredRecipes = recipes.filter((recipe) => {
    return recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
           recipe.ingredients.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsModalOpen(true);
  };

  const handleDelete = async (recipe: Recipe) => {
      await removeRecipe(recipe.id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecipe(null);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <AddRecipeModal isOpen={isModalOpen} onClose={handleCloseModal} editRecipe={editingRecipe} />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('recipes.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('recipes.subtitle', { count: recipes.length })}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('recipes.add')}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder={t('recipes.search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Recipe List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
          <div className="bg-gray-100 p-4 rounded-full mb-4">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">{t('recipes.empty.title')}</h3>
          <p className="mt-1">{t('recipes.empty.desc')}</p>
        </div>
      )}
    </div>
  );
};

export default Recipes;
