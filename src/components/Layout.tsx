import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Store, Utensils, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

const Layout: React.FC = () => {
  const { t } = useTranslation();
  
  const navItems = [
    { to: '/', icon: Home, label: t('nav.home') },
    { to: '/shops', icon: Store, label: t('nav.shops') },
    { to: '/recipes', icon: Utensils, label: t('nav.recipes') },
    { to: '/profile', icon: User, label: t('nav.profile') },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary">{t('app.title')}</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="max-w-4xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 px-2 z-50 safe-area-bottom">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1",
                isActive ? "text-blue-600" : "text-gray-500"
              )
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
