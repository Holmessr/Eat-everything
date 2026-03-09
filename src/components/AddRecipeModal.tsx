import React, { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRecipeStore } from '../stores/recipeStore';
import { X, Upload, Plus, Loader2 } from 'lucide-react';
import { Recipe } from '../types';
import { useTranslation } from 'react-i18next';
import { compressImage } from '../utils/imageCompression';

const recipeFormSchema = z.object({
  name: z.string().min(1, 'required'),
  rating: z.number().min(1).max(5),
  tags: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard'] as const),
  prep_time: z.number().min(0), // snake_case
  cook_time: z.number().min(0), // snake_case
  ingredients: z.string(),
  steps: z.string(),
  image_url: z.string().optional().or(z.literal('')), // snake_case
  source_url: z.string().min(1, 'required'), // snake_case, required
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
  const [detailImages, setDetailImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      prep_time: 10,
      cook_time: 10,
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
      setValue('prep_time', editRecipe.prep_time);
      setValue('cook_time', editRecipe.cook_time);
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
        prep_time: 10,
        cook_time: 10,
        ingredients: '',
        steps: '',
        image_url: '',
        source_url: '',
      });
      setDetailImages([]);
    }
  }, [editRecipe, setValue, reset, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      try {
        const compressedImages = await Promise.all(
          fileArray.map((file) => compressImage(file, 800, 0.7))
        );
        setDetailImages((prev) => [...prev, ...compressedImages]);
      } catch (error) {
        console.error('Error compressing images:', error);
      }
    }
  };

  const removeDetailImage = (index: number) => {
    setDetailImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedDataUrl = await compressImage(file, 800, 0.7);
        setValue('image_url', compressedDataUrl);
      } catch (error) {
        console.error('Error compressing image:', error);
      }
    }
  };

  const onSubmit = async (data: RecipeFormValues) => {
    // Remove id generation, let Supabase handle it
    const recipeData: Omit<Recipe, 'id' | 'user_id'> = {
      name: data.name,
      rating: data.rating,
      difficulty: data.difficulty,
      prep_time: data.prep_time,
      cook_time: data.cook_time,
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
        // @ts-ignore - The store handles the rest
        await addRecipe(recipeData);
      }
      
      reset();
      setDetailImages([]);
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
      // Optional: show toast error
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[70vh]">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">{editRecipe ? t('recipes.edit') : t('recipes.add')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 p-4">
            <form id="recipe-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
           {/* Cover Image */}
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('recipes.form.cover')}</label>
              <div className="space-y-2">
                  <div className="flex gap-2">
                       <input
                          {...register('image_url')}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder={t('recipes.form.coverPlaceholder')}
                      />
                      <label className="flex items-center justify-center px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
                          <Upload className="w-4 h-4 text-gray-600" />
                          <input type="file" accept="image/*" className="hidden" onChange={handleCoverImageUpload} />
                      </label>
                  </div>
                  {watch('image_url') && (
                      <div className="relative h-32 w-full rounded-lg overflow-hidden bg-gray-100">
                          <img src={watch('image_url') || ''} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                  )}
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
              placeholder={t('recipes.form.sourceUrlPlaceholder')}
            />
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('recipes.form.prepTime')}</label>
              <input
                type="number"
                min="0"
                {...register('prep_time', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('recipes.form.cookTime')}</label>
              <input
                type="number"
                min="0"
                {...register('cook_time', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('recipes.form.tags')}</label>
              <input
                {...register('tags')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={t('recipes.form.tagsPlaceholder')}
              />
            </div>

            {/* Moved sourceUrl to top */}
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
        </div>

        <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0 flex gap-3 rounded-b-xl">
            <button
              type="submit"
              form="recipe-form"
              disabled={loading}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editRecipe ? t('recipes.form.save') : t('recipes.form.addSubmit'))}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AddRecipeModal;
