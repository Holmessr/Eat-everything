import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useShopStore } from '../stores/shopStore';
import { X } from 'lucide-react';

const shopFormSchema = z.object({
  name: z.string().min(1, '店铺名称不能为空'),
  type: z.enum(['delivery', 'dine-in'] as const),
  rating: z.number().min(1).max(5),
  tags: z.string(),
  imageUrl: z.string().optional().or(z.literal('')),
  address: z.string().optional(),
});

type ShopFormValues = z.infer<typeof shopFormSchema>;

interface AddShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddShopModal: React.FC<AddShopModalProps> = ({ isOpen, onClose }) => {
  const { addShop } = useShopStore();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShopFormValues>({
    resolver: zodResolver(shopFormSchema),
    defaultValues: {
      type: 'dine-in',
      rating: 5,
      tags: '',
      imageUrl: '',
      address: '',
    },
  });

  const onSubmit = (data: ShopFormValues) => {
    addShop({
      id: Date.now().toString(),
      ...data,
      tags: data.tags.split(/[,，]/).map((t) => t.trim()).filter((t) => t.length > 0),
      visitCount: 0,
    });
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">添加新店铺</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">图片链接 (可选)</label>
            <input
              {...register('imageUrl')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
             {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl.message}</p>}
          </div>

           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">地址 (可选)</label>
            <input
              {...register('address')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如：南山区科技园..."
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              保存店铺
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddShopModal;
