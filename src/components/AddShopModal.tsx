import React, { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useShopStore } from '../stores/shopStore';
import { X, Upload, Plus } from 'lucide-react';
import { Shop } from '../types';

const shopFormSchema = z.object({
  name: z.string().min(1, '店铺名称不能为空'),
  type: z.enum(['delivery', 'dine-in'] as const),
  rating: z.number().min(1).max(5),
  tags: z.string(),
  imageUrl: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
});

type ShopFormValues = z.infer<typeof shopFormSchema>;

interface AddShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  editShop?: Shop | null;
}

const AddShopModal: React.FC<AddShopModalProps> = ({ isOpen, onClose, editShop }) => {
  const { addShop, updateShop } = useShopStore();
  const [detailImages, setDetailImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ShopFormValues>({
    // @ts-ignore
    resolver: zodResolver(shopFormSchema),
    defaultValues: {
      type: 'dine-in',
      rating: 5,
      tags: '',
      imageUrl: '',
      address: '',
      description: '',
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (editShop) {
      setValue('name', editShop.name);
      setValue('type', editShop.type);
      setValue('rating', editShop.rating);
      setValue('tags', editShop.tags.join(', '));
      setValue('imageUrl', editShop.imageUrl || '');
      setValue('address', editShop.address || '');
      setValue('description', editShop.description || '');
      setDetailImages(editShop.images || []);
    } else {
      reset({
        name: '',
        type: 'dine-in',
        rating: 5,
        tags: '',
        imageUrl: '',
        address: '',
        description: '',
      });
      setDetailImages([]);
    }
  }, [editShop, setValue, reset, isOpen]);


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


  const onSubmit = (data: ShopFormValues) => {
    const shopData: Shop = {
      ...data,
      name: data.name,
      type: data.type,
      rating: data.rating,
      imageUrl: data.imageUrl,
      address: data.address,
      description: data.description,
      id: editShop ? editShop.id : Date.now().toString(),
      visitCount: editShop ? editShop.visitCount : 0,
      tags: data.tags.split(/[,，]/).map((t) => t.trim()).filter((t) => t.length > 0),
      images: detailImages,
    };

    if (editShop) {
      updateShop(editShop.id, shopData);
    } else {
      addShop(shopData);
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
          <h2 className="text-lg font-bold text-gray-900">{editShop ? '编辑店铺' : '添加新店铺'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 p-4">
            <form id="shop-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Cover Image */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">封面图片</label>
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <input
                            {...register('imageUrl')}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">店铺名称</label>
                <input
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：麦当劳"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                <select
                    {...register('type')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="dine-in">堂食</option>
                    <option value="delivery">外卖</option>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标签 (用逗号分隔)</label>
                <input
                {...register('tags')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：快餐, 汉堡, 便宜"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">地址 (可选)</label>
                <input
                {...register('address')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：南山区科技园..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述 (可选)</label>
                <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="写点什么..."
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
                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
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
              form="shop-form"
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {editShop ? '保存修改' : '添加店铺'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AddShopModal;
