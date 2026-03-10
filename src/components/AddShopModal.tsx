import React, { useRef, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useShopStore } from '../stores/shopStore';
import { X, Upload, Plus, Loader2 } from 'lucide-react';
import { Shop } from '../types';
import { useTranslation } from 'react-i18next';
import { useImageUpload } from '../hooks/useImageUpload';
import toast from 'react-hot-toast';
import Modal from './Modal';
import { extractShopFields, requestOcr } from '../lib/ocr';
import { compressImageForOcr } from '../utils/imageCompression';

const shopFormSchema = z.object({
  name: z.string().min(1, 'required'),
  type: z.enum(['delivery', 'dine-in'] as const),
  rating: z.number().min(1).max(5),
  tags: z.string(),
  image_url: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  platform_link: z.string().optional().or(z.literal('')),
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ocrImage, setOcrImage] = useState<string | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  
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
  } = useForm<ShopFormValues>({
    resolver: zodResolver(shopFormSchema),
    defaultValues: {
      type: 'delivery', // Default to delivery
      rating: 5,
      tags: '',
      image_url: '',
      address: '',
      platform_link: '',
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (editShop) {
      setValue('name', editShop.name);
      setValue('type', editShop.type);
      setValue('rating', editShop.rating);
      setValue('tags', editShop.tags.join(', '));
      setValue('image_url', editShop.image_url || '');
      setValue('address', editShop.address || '');
      setValue('platform_link', editShop.platform_link || '');
      setDetailImages(editShop.images || []);
      setOcrImage(null);
    } else {
      reset({
        name: '',
        type: 'delivery',
        rating: 5,
        tags: '',
        image_url: '',
        address: '',
        platform_link: '',
      });
      setDetailImages([]);
      setOcrImage(null);
    }
  }, [editShop, setValue, reset, isOpen, setDetailImages]);

  const onCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    await handleCoverImageUpload(e, (url) => setValue('image_url', url));
    if (!file) {
      return;
    }
    try {
      const nextOcrImage = await compressImageForOcr(file);
      setOcrImage(nextOcrImage);
    } catch {
      setOcrImage(null);
    }
  };

  const onRecognizeClick = async () => {
    if (!ocrImage || isRecognizing) return;
    setIsRecognizing(true);
    const toastId = toast.loading('识别中...');
    try {
      const res = await requestOcr(ocrImage);
      if (!res.success || !res.text) {
        toast.dismiss(toastId);
        return;
      }

      const fields = extractShopFields(res.text);
      const currentName = watch('name');
      const currentAddress = watch('address');

      if (!currentName && fields.name) setValue('name', fields.name);
      if (!currentAddress && fields.address) setValue('address', fields.address);

      toast.dismiss(toastId);
    } catch {
      toast.dismiss(toastId);
    } finally {
      setIsRecognizing(false);
    }
  };

  const onSubmit = async (data: ShopFormValues) => {
    const shopData: Omit<Shop, 'id' | 'user_id' | 'visit_count' | 'description'> = {
      name: data.name,
      type: data.type,
      rating: data.rating,
      image_url: data.image_url,
      address: data.address,
      platform_link: data.platform_link,
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
    }
  };

  const footer = (
    <button
      type="submit"
      form="shop-form"
      disabled={loading || isUploading}
      className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading || isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editShop ? t('shops.form.save') : t('shops.form.addSubmit'))}
    </button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editShop ? t('shops.edit') : t('shops.add')}
      footer={footer}
    >
      <form id="shop-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Cover Image - Upload Only */}
        <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">{t('shops.form.cover')}</label>
              <button
                type="button"
                onClick={onRecognizeClick}
                disabled={!ocrImage || isRecognizing}
                className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRecognizing ? '识别中...' : '识别'}
              </button>
            </div>
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
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500">{t('shops.form.coverPlaceholder')}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={onCoverImageUpload} />
                    </label>
                )}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('shops.form.type')}</label>
            <select
                {...register('type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="delivery">{t('shops.filter.delivery')}</option>
                <option value="dine-in">{t('shops.filter.dineIn')}</option>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('shops.form.name')}</label>
            <input
            {...register('name')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('shops.form.namePlaceholder')}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{t('shops.form.validation.nameRequired')}</p>}
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('shops.form.platformLink')}
            </label>
            <input
            type="url"
            {...register('platform_link')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Link"
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
    </Modal>
  );
};

export default AddShopModal;
