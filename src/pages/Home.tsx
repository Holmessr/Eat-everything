import React, { useState, useEffect, useRef } from 'react';
import { useShopStore } from '../stores/shopStore';
import { useRecipeStore } from '../stores/recipeStore';
import { Sparkles, Utensils, RefreshCw, Send, Bot } from 'lucide-react';
import ShopCard from '../components/ShopCard';
import RecipeCard from '../components/RecipeCard';
import { Shop, Recipe } from '../types';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const Home: React.FC = () => {
  const { t } = useTranslation();
  const { shops } = useShopStore();
  const { recipes } = useRecipeStore();
  const [recommendation, setRecommendation] = useState<{ type: 'shop' | 'recipe'; data: Shop | Recipe } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Selection state
  const [selectedType, setSelectedType] = useState<'recipe' | 'delivery' | 'dine-in'>('recipe');

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: t('home.ai.initialMessage'),
      timestamp: Date.now()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Only scroll to bottom when new messages added, not on initial load
    if (messages.length > 1) {
        scrollToBottom();
    }
  }, [messages]);

  const handleRecommend = () => {
    setIsAnimating(true);
    setRecommendation(null);
    
    // Simulate thinking/randomizing time
    setTimeout(() => {
      let candidates: Array<{ type: 'shop' | 'recipe'; data: Shop | Recipe }> = [];

      if (selectedType === 'recipe') {
        candidates = recipes.map(r => ({ type: 'recipe', data: r }));
      } else {
        candidates = shops
          .filter(s => s.type === selectedType)
          .map(s => ({ type: 'shop', data: s }));
      }
      
      if (candidates.length > 0) {
        const randomItem = candidates[Math.floor(Math.random() * candidates.length)];
        setRecommendation(randomItem);
      } else {
        // Fallback or empty state handling could go here
        // For now, if no items match, we might want to show a toast or alert
        alert(`没有找到${selectedType === 'recipe' ? t('home.select.recipe') : selectedType === 'delivery' ? t('home.select.delivery') : t('home.select.dineIn')}，请先添加一些数据！`);
      }
      setIsAnimating(false);
    }, 800);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
        const payload = {
          userPreferences: {},
          context: {
            userMessage: userMsg.content,
            shops,
            recipes,
          },
        };
        const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
        const resp = await fetch(`${API_BASE}/api/ai/recommend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await resp.json();
        const content =
          data?.content ??
          data?.choices?.[0]?.message?.content ??
          t('home.ai.error');
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
        console.error('AI Error:', error);
    } finally {
        setIsTyping(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-12 pb-24">
      {/* 1. 帮我选一个 Section */}
      <div className="space-y-8 text-center">
        <div className="space-y-2 mt-4">
          <h1 className="text-3xl font-bold text-gray-900">{t('home.title')}</h1>
          <p className="text-gray-500">{t('home.subtitle')}</p>
        </div>

        {/* Selection Type Toggles */}
        <div className="flex justify-center gap-2">
            {[
                { id: 'recipe', label: t('home.select.recipe') },
                { id: 'delivery', label: t('home.select.delivery') },
                { id: 'dine-in', label: t('home.select.dineIn') }
            ].map((type) => (
                <button
                    key={type.id}
                    onClick={() => {
                        setSelectedType(type.id as 'recipe' | 'delivery' | 'dine-in');
                        setRecommendation(null);
                    }}
                    className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                        selectedType === type.id 
                            ? "bg-blue-600 text-white border-blue-600 shadow-md" 
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    )}
                >
                    {type.label}
                </button>
            ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleRecommend}
            disabled={isAnimating}
            className={cn(
              "relative group flex items-center justify-center px-8 py-4",
              "bg-gradient-to-r from-blue-600 to-purple-600 text-white",
              "rounded-full shadow-lg hover:shadow-xl transition-all",
              "disabled:opacity-80 disabled:cursor-not-allowed",
              isAnimating ? 'scale-95' : 'hover:scale-105'
            )}
          >
            <Sparkles className={cn("w-6 h-6 mr-2", isAnimating && "animate-spin")} />
            <span className="text-lg font-bold">
              {isAnimating ? t('home.button.thinking') : t('home.button.recommend')}
            </span>
          </button>
        </div>

        {recommendation && (
          <div className="animate-fade-in-up max-w-sm mx-auto">
            <div className="flex items-center justify-center mb-4 space-x-2 text-gray-500">
              {recommendation.type === 'shop' ? <Utensils className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {t('home.recommendation.prefix')} {recommendation.type === 'shop' ? t('home.recommendation.shop') : t('home.recommendation.recipe')}
              </span>
            </div>
            
            <div className="transform transition-all hover:scale-[1.02] text-left">
              {recommendation.type === 'shop' ? (
                <ShopCard shop={recommendation.data as Shop} />
              ) : (
                <RecipeCard recipe={recommendation.data as Recipe} />
              )}
            </div>
            
            <div className="flex justify-center mt-6 gap-4">
              <button 
                onClick={handleRecommend}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                {t('home.button.change')}
              </button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                {t('home.button.choose')}
              </button>
            </div>
          </div>
        )}
      </div>

      <hr className="border-gray-100" />

      {/* 2. 智能饮食助手 Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[500px]">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div>
                <h2 className="font-bold text-gray-900">{t('home.ai.title')}</h2>
                <p className="text-xs text-gray-500">{t('home.ai.poweredBy')}</p>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={cn(
                        "flex w-full", // Ensure full width container
                        msg.role === 'user' ? "justify-end" : "justify-start" // Flex alignment
                    )}
                >
                    <div
                        className={cn(
                            "p-3 rounded-2xl text-sm leading-relaxed max-w-[80%]", // Max width on bubble
                            msg.role === 'user'
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm"
                        )}
                    >
                        {msg.content}
                    </div>
                </div>
            ))}
            {isTyping && (
                <div className="flex w-full justify-start">
                    <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
            <div className="relative flex items-center">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={t('home.ai.placeholder')}
                    className="w-full pl-4 pr-12 py-3 bg-gray-100 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                />
                <button
                    type="submit"
                    disabled={!inputMessage.trim() || isTyping}
                    className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default Home;
