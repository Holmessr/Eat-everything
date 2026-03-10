import React, { useState } from 'react';
import { Recipe } from '../types';
import { Star, Clock, ChefHat, X, ChevronLeft, ChevronRight, MoreHorizontal, Edit2, Trash2, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ConfirmModal from './ConfirmModal';

interface RecipeCardProps {
  recipe: Recipe;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: (recipe: Recipe) => Promise<void>;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const allImages = [
    ...(recipe.image_url ? [recipe.image_url] : []), // snake_case
    ...(recipe.images || [])
  ];

  const difficultyColor = {
    easy: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    hard: 'text-red-600 bg-red-50',
  };

  const difficultyLabel = {
    easy: t('recipes.difficulty.easy'),
    medium: t('recipes.difficulty.medium'),
    hard: t('recipes.difficulty.hard'),
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allImages.length > 0) {
        setIsModalOpen(true);
    }
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    if (recipe.source_url) {
      e.stopPropagation();
      window.open(recipe.source_url, '_blank', 'noopener,noreferrer');
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const toggleMenu = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowMenu(!showMenu);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    try {
      setIsDeleting(true);
      await onDelete(recipe);
    } catch (error) {
      console.error(error);
      setIsDeleting(false);
    } finally {
      setShowConfirmDelete(false);
      setShowMenu(false);
    }
  };

  return (
    <>
      <div 
        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 group cursor-pointer relative"
      >
        <div 
          className="relative h-48 bg-gray-200 overflow-hidden"
          onClick={handleImageClick}
        >
          {recipe.image_url ? ( // snake_case
            <img
              src={recipe.image_url} // snake_case
              alt={recipe.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No Image
            </div>
          )}
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium ${difficultyColor[recipe.difficulty]}`}>
            {difficultyLabel[recipe.difficulty]}
          </div>
          {recipe.images && recipe.images.length > 0 && (
             <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded-md text-xs text-white">
                +{recipe.images.length}
             </div>
          )}
        </div>
        <div className="p-4" onClick={handleTitleClick}>
          <div className="flex justify-between items-start mb-2">
            <h3 className={`text-lg font-bold text-gray-900 truncate pr-8 ${recipe.source_url ? 'text-blue-600 hover:underline' : ''}`}>
              {recipe.name}
            </h3>
            <div className="flex items-center text-yellow-500 flex-shrink-0">
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
                  <ChefHat className="w-3 h-3 mr-1" />
                  <span>{t('recipes.card.ingredientsCount', { count: recipe.ingredients.length })}</span>
              </div>
          </div>
        </div>

        {/* Action Menu */}
        {(onEdit || onDelete) && (
            <div className="absolute bottom-4 right-4">
                <button 
                    onClick={toggleMenu}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <MoreHorizontal className="w-5 h-5" />
                </button>
                
                {showMenu && (
                    <>
                        <div 
                            className="fixed inset-0 z-10" 
                            onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} 
                        />
                        <div className="absolute right-0 bottom-full mb-2 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 overflow-hidden">
                            {onEdit && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMenu(false);
                                        onEdit(recipe);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    {t('recipes.card.menu.edit')}
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    disabled={isDeleting}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowConfirmDelete(true);
                                        setShowMenu(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center disabled:opacity-50"
                                >
                                    {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                    {t('recipes.card.menu.delete')}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDelete}
        title={t('recipes.form.confirmDelete')}
        message="确认要删除这个菜谱吗？此操作无法撤销。"
        confirmText={t('recipes.card.menu.delete')}
        loading={isDeleting}
      />

       {/* Image Gallery Modal */}
       {isModalOpen && allImages.length > 0 && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4" onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(false);
        }}>
          <button 
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative max-w-4xl max-h-[80vh] w-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
             {allImages.length > 1 && (
                <>
                    <button 
                        onClick={prevImage}
                        className="absolute left-2 md:-left-12 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button 
                        onClick={nextImage}
                        className="absolute right-2 md:-right-12 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>
                </>
             )}
             
             <img 
                src={allImages[currentImageIndex]} 
                alt={`${recipe.name} - ${currentImageIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
             />
             
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                {currentImageIndex + 1} / {allImages.length}
             </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecipeCard;
