import React, { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRecipeStore } from '../stores/recipeStore';
import { X, Upload, Plus } from 'lucide-react';
import { Recipe } from '../types';

const recipeFormSchema = z.object({
  name: z.string().min(1, '菜谱名称不能为空'),
  rating: z.number().min(1).max(5),
  tags: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard'] as const),
  prepTime: z.number().min(0),
  cookTime: z.number().min(0),
  ingredients: z.string(),
  steps: z.string(),
  imageUrl: z.string().optional().or(z.literal('')),
  sourceUrl: z.string().optional().or(z.literal('')),
});

type RecipeFormValues = z.infer<typeof recipeFormSchema>;

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editRecipe?: Recipe | null;
}

const AddRecipeModal: React.FC<AddRecipeModalProps> = ({ isOpen, onClose, editRecipe }) => {
  const { addRecipe, updateRecipe } = useRecipeStore();
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
      prepTime: 10,
      cookTime: 10,
      ingredients: '',
      steps: '',
      imageUrl: '',
      sourceUrl: '',
    },
  });

  useEffect(() => {
    if (editRecipe) {
      setValue('name', editRecipe.name);
      setValue('rating', editRecipe.rating);
      setValue('tags', editRecipe.tags.join(', '));
      setValue('difficulty', editRecipe.difficulty);
      setValue('prepTime', editRecipe.prepTime);
      setValue('cookTime', editRecipe.cookTime);
      setValue('ingredients', editRecipe.ingredients.join('\n'));
      setValue('steps', editRecipe.steps.join('\n'));
      setValue('imageUrl', editRecipe.imageUrl || '');
      setValue('sourceUrl', editRecipe.sourceUrl || '');
      setDetailImages(editRecipe.images || []);
    } else {
      reset({
        name: '',
        rating: 5,
        tags: '',
        difficulty: 'easy',
        prepTime: 10,
        cookTime: 10,
        ingredients: '',
        steps: '',
        imageUrl: '',
        sourceUrl: '',
      });
      setDetailImages([]);
    }
  }, [editRecipe, setValue, reset, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setDetailImages(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeDetailImage = (index: number) => {
    setDetailImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setValue('imageUrl', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: RecipeFormValues) => {
    const recipeData: Recipe = {
      ...data,
      name: data.name,
      rating: data.rating,
      difficulty: data.difficulty,
      prepTime: data.prepTime,
      cookTime: data.cookTime,
      imageUrl: data.imageUrl,
      sourceUrl: data.sourceUrl,
      id: editRecipe ? editRecipe.id : Date.now().toString(),
      tags: data.tags.split(/[,，]/).map((t) => t.trim()).filter((t) => t.length > 0),
      ingredients: data.ingredients.split('\n').map((i) => i.trim()).filter((i) => i.length > 0),
      steps: data.steps.split('\n').map((s) => s.trim()).filter((s) => s.length > 0),
      images: detailImages,
    };

    if (editRecipe) {
      updateRecipe(editRecipe.id, recipeData);
    } else {
      addRecipe(recipeData);
    }
    
    reset();
    setDetailImages([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg my-8 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">{editRecipe ? '编辑菜谱' : '添加新菜谱'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 p-4">
            <form id="recipe-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
           {/* Cover Image */}
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">封面图片</label>
              <div className="space-y-2">
                  <div className="flex gap-2">
                       <input
                          {...register('imageUrl')}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="输入图片链接或上传本地图片"
                      />
                      <label className="flex items-center justify-center px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
                          <Upload className="w-4 h-4 text-gray-600" />
                          <input type="file" accept="image/*" className="hidden" onChange={handleCoverImageUpload} />
                      </label>
                  </div>
                  {watch('imageUrl') && (
                      <div className="relative h-32 w-full rounded-lg overflow-hidden bg-gray-100">
                          <img src={watch('imageUrl')} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                  )}
              </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">菜谱名称</label>
            <input
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="例如：番茄炒蛋"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">难度</label>
              <select
                {...register('difficulty')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">困难</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">评分 (1-5)</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">准备时间 (分钟)</label>
              <input
                type="number"
                min="0"
                {...register('prepTime', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">烹饪时间 (分钟)</label>
              <input
                type="number"
                min="0"
                {...register('cookTime', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标签 (用逗号分隔)</label>
            <input
              {...register('tags')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="例如：家常菜, 快手菜"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">食材 (每行一种)</label>
            <textarea
              {...register('ingredients')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="例如：&#10;鸡蛋 2个&#10;番茄 1个"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">步骤 (每行一步)</label>
            <textarea
              {...register('steps')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="例如：&#10;1. 准备食材&#10;2. 开火烹饪"
            />
          </div>

          {/* Detail Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">更多图片</label>
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
                <span className="text-xs text-gray-500 mt-1">添加图片</span>
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
              className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              {editRecipe ? '保存修改' : '添加菜谱'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AddRecipeModal;
