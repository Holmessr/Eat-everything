import React, { useState, useEffect } from 'react';
import { useShopStore } from '../stores/shopStore';
import ShopCard from '../components/ShopCard';
import AddShopModal from '../components/AddShopModal';
import { ShopType, Shop } from '../types';
import { Plus, Search, Filter, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const Shops: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { shops, removeShop, fetchShops, loading } = useShopStore();
  const [filterType, setFilterType] = useState<ShopType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const handleAddClick = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      if (confirm('请先登录后再添加店铺。是否去登录？')) {
        navigate('/auth');
      }
    } else {
      setIsModalOpen(true);
    }
  };

  const filteredShops = shops.filter((shop) => {
    const matchesType = filterType === 'all' || shop.type === filterType;
    const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          shop.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const handleEdit = (shop: Shop) => {
    setEditingShop(shop);
    setIsModalOpen(true);
  };

  const handleDelete = async (shop: Shop) => {
      await removeShop(shop.id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingShop(null);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <AddShopModal isOpen={isModalOpen} onClose={handleCloseModal} editShop={editingShop} />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('shops.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('shops.subtitle', { count: shops.length })}</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('shops.add')}
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('shops.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setFilterType('all')}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
              filterType === 'all' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
            )}
          >
            {t('shops.filter.all')}
          </button>
          <button
            onClick={() => setFilterType('delivery')}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
              filterType === 'delivery' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
            )}
          >
            {t('shops.filter.delivery')}
          </button>
          <button
            onClick={() => setFilterType('dine-in')}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
              filterType === 'dine-in' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
            )}
          >
            {t('shops.filter.dineIn')}
          </button>
        </div>
      </div>

      {/* Shop List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredShops.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop) => (
            <ShopCard 
                key={shop.id} 
                shop={shop} 
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
          <div className="bg-gray-100 p-4 rounded-full mb-4">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">{t('shops.empty.title')}</h3>
          <p className="mt-1">{t('shops.empty.desc')}</p>
        </div>
      )}
    </div>
  );
};

export default Shops;
