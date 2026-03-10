import React, { useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRecipeStore } from '../stores/recipeStore';
import { X, Upload, Plus, Loader2 } from 'lucide-react';
import { Recipe } from '../types';
import { useTranslation } from 'react-i18next';
import { useImageUpload } from '../hooks/useImageUpload';
import Modal from './Modal';

const recipeFormSchema = z.object({
  name: z.string().min(1, 'required'),
  rating: z.number().min(1).max(5),
  tags: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard'] as const),
  ingredients: z.string(),
  steps: z.string(),
  image_url: z.string().optional().or(z.literal('')),
  source_url: z.string().optional().or(z.literal('')),
});

type RecipeFormValues = z.infer<typeof recipeFormSchema>;

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editRecipe?: Recipe | null;
}

const AddRecipeModal: React.FC<AddRecipeModalProps> = ({ isOpen, onClose, editRecipe }) => {
  const { t } = useTranslation();
  const { addRecipe, updateRecipe, loading } = useRecipeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    images: detailImages,
    setImages: setDetailImages,
    handleImageUpload,
    handleCoverImageUpload,
    removeImage: removeDetailImage,
    isUploading
  } = useImageUpload();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RecipeFormValues>({
    // @ts-ignore
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      rating: 5,
      tags: '',
      difficulty: 'easy',
      ingredients: '',
      steps: '',
      image_url: '',
      source_url: '',
    },
  });

  useEffect(() => {
    if (editRecipe) {
      setValue('name', editRecipe.name);
      setValue('rating', editRecipe.rating);
      setValue('tags', editRecipe.tags.join(', '));
      setValue('difficulty', editRecipe.difficulty);
      setValue('ingredients', editRecipe.ingredients.join('\n'));
      setValue('steps', editRecipe.steps.join('\n'));
      setValue('image_url', editRecipe.image_url || '');
      setValue('source_url', editRecipe.source_url || '');
      setDetailImages(editRecipe.images || []);
    } else {
      reset({
        name: '',
        rating: 5,
        tags: '',
        difficulty: 'easy',
        ingredients: '',
        steps: '',
        image_url: '',
        source_url: '',
      });
      setDetailImages([]);
    }
  }, [editRecipe, setValue, reset, isOpen, setDetailImages]);

  const onCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleCoverImageUpload(e, (url) => setValue('image_url', url));
  };

  const onSubmit = async (data: RecipeFormValues) => {
    const recipeData: Omit<Recipe, 'id' | 'user_id' | 'prep_time' | 'cook_time'> = {
      name: data.name,
      rating: data.rating,
      difficulty: data.difficulty,
      image_url: data.image_url,
      source_url: data.source_url,
      tags: data.tags.split(/[,，]/).map((t) => t.trim()).filter((t) => t.length > 0),
      ingredients: data.ingredients.split('\n').map((i) => i.trim()).filter((i) => i.length > 0),
      steps: data.steps.split('\n').map((s) => s.trim()).filter((s) => s.length > 0),
      images: detailImages,
    };

    try {
      if (editRecipe) {
        await updateRecipe(editRecipe.id, recipeData);
      } else {
        // @ts-ignore
        await addRecipe(recipeData);
      }
      
      reset();
      setDetailImages([]);
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const footer = (
    <button
      type="submit"
      form="recipe-form"
      disabled={loading || isUploading}
      className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading || isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editRecipe ? t('recipes.form.save') : t('recipes.form.addSubmit'))}
    </button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editRecipe ? t('recipes.edit') : t('recipes.add')}
      footer={footer}
    >
      <form id="recipe-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Cover Image - Upload Only */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('recipes.form.cover')}</label>
            <div className="space-y-2">
                {watch('image_url') ? (
                    <div className="relative h-32 w-full rounded-lg overflow-hidden bg-gray-100 group">
                        <img src={watch('image_url') || ''} alt="Preview" className="w-full h-full object-cover" />
                        <label className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Upload className="w-6 h-6 text-white" />
                            <input type="file" accept="image/*" className="hidden" onChange={onCoverImageUpload} />
                        </label>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors">
                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500">{t('recipes.form.coverPlaceholder')}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={onCoverImageUpload} />
                    </label>
                )}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('recipes.form.difficulty')}</label>
              <select
                {...register('difficulty')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="easy">{t('recipes.difficulty.easy')}</option>
                <option value="medium">{t('recipes.difficulty.medium')}</option>
                <option value="hard">{t('recipes.difficulty.hard')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('recipes.form.rating')}</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                {...register('rating', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('recipes.form.name')}</label>
            <input
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={t('recipes.form.namePlaceholder')}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{t('recipes.form.validation.nameRequired')}</p>}
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('recipes.form.sourceUrl')}</label>
            <input
              {...register('source_url')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Link"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('recipes.form.tags')}</label>
            <input
            {...register('tags')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder={t('recipes.form.tagsPlaceholder')}
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('recipes.form.ingredients')}</label>
            <textarea
              {...register('ingredients')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={t('recipes.form.ingredientsPlaceholder')}
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('recipes.form.steps')}</label>
            <textarea
              {...register('steps')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={t('recipes.form.stepsPlaceholder')}
            />
        </div>

        {/* Detail Images */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('recipes.form.moreImages')}</label>
            <div className="grid grid-cols-3 gap-2">
              {detailImages.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img src={img} alt={`Detail ${index}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeDetailImage(index)}
                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors">
                <Plus className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-500 mt-1">{t('recipes.form.addImage')}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddRecipeModal;
