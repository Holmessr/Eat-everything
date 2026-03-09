import React, { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useShopStore } from '../stores/shopStore';
import { X, Upload, Plus, Loader2 } from 'lucide-react';
import { Shop } from '../types';
import { useTranslation } from 'react-i18next';

const shopFormSchema = z.object({
  name: z.string().min(1, 'required'),
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
  const { t } = useTranslation();
  const { addShop, updateShop, loading } = useShopStore();
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


  const onSubmit = async (data: ShopFormValues) => {
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

    try {
      if (editShop) {
        await updateShop(editShop.id, shopData);
      } else {
        await addShop(shopData);
      }
      
      reset();
      setDetailImages([]);
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
      // Optional: show toast error here
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[calc(100vh-2rem)] md:max-h-[85vh]">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">{editShop ? t('shops.edit') : t('shops.add')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 p-4">
            <form id="shop-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Cover Image */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('shops.form.cover')}</label>
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <input
                            {...register('imageUrl')}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={t('shops.form.coverPlaceholder')}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('shops.form.name')}</label>
                <input
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('shops.form.namePlaceholder')}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{t('shops.form.validation.nameRequired')}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('shops.form.type')}</label>
                <select
                    {...register('type')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="dine-in">{t('shops.filter.dineIn')}</option>
                    <option value="delivery">{t('shops.filter.delivery')}</option>
                </select>
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('shops.form.rating')}</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('shops.form.tags')}</label>
                <input
                {...register('tags')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('shops.form.tagsPlaceholder')}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('shops.form.address')}</label>
                <input
                {...register('address')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('shops.form.addressPlaceholder')}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('shops.form.desc')}</label>
                <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('shops.form.descPlaceholder')}
                />
            </div>

            {/* Detail Images */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('shops.form.moreImages')}</label>
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
                    <span className="text-xs text-gray-500 mt-1">{t('shops.form.addImage')}</span>
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
              disabled={loading}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editShop ? t('shops.form.save') : t('shops.form.addSubmit'))}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AddShopModal;
