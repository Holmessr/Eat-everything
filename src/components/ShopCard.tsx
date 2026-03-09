import React, { useState } from 'react';
import { Shop } from '../types';
import { Star, MapPin, Clock, X, ChevronLeft, ChevronRight, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';

interface ShopCardProps {
  shop: Shop;
  onEdit?: (shop: Shop) => void;
  onDelete?: (shop: Shop) => void;
}

const ShopCard: React.FC<ShopCardProps> = ({ shop, onEdit, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  const allImages = [
    ...(shop.imageUrl ? [shop.imageUrl] : []),
    ...(shop.images || [])
  ];

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent opening modal if clicking on buttons or links
    if ((e.target as HTMLElement).closest('button')) return;
    if (allImages.length > 0) {
        setIsModalOpen(true);
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

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 group cursor-pointer relative"
      >
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          {shop.imageUrl ? (
            <img
              src={shop.imageUrl}
              alt={shop.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No Image
            </div>
          )}
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-gray-700">
            {shop.type === 'delivery' ? '外卖' : '堂食'}
          </div>
          {shop.images && shop.images.length > 0 && (
             <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded-md text-xs text-white">
                +{shop.images.length}
             </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-gray-900 truncate pr-8">{shop.name}</h3>
            <div className="flex items-center text-yellow-500 flex-shrink-0">
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
                                        onEdit(shop);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    编辑
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMenu(false);
                                        onDelete(shop);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    删除
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        )}
      </div>

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
                alt={`${shop.name} - ${currentImageIndex + 1}`}
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

export default ShopCard;
