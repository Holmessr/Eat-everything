import React from 'react';
import { Shop } from '../types';
import { Star, MapPin, Clock } from 'lucide-react';

interface ShopCardProps {
  shop: Shop;
}

const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
      <div className="relative h-48 bg-gray-200">
        {shop.imageUrl ? (
          <img
            src={shop.imageUrl}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No Image
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-gray-700">
          {shop.type === 'delivery' ? '外卖' : '堂食'}
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 truncate">{shop.name}</h3>
          <div className="flex items-center text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="ml-1 text-sm font-medium">{shop.rating}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {shop.tags.map((tag) => (
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
                <span>{shop.visitCount} 次光顾</span>
            </div>
            {shop.address && (
                 <div className="flex items-center truncate max-w-[150px]">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="truncate">{shop.address}</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ShopCard;
