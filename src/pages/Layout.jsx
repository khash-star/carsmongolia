
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getCurrentUser, logout } from '@/services/auth';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Car, Menu, X, LogIn, LogOut, User } from 'lucide-react';
import InstallPrompt from '@/components/pwa/InstallPrompt.jsx';

export default function Layout({ children, currentPageName }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      // Always get fresh user data from Firestore to ensure role is up to date
      const currentUser = await getCurrentUser();
      if (currentUser) {
        // Update localStorage with fresh user data
        localStorage.setItem('user', JSON.stringify(currentUser));
        return currentUser;
      }
      
      // Fallback to localStorage if getCurrentUser fails
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch {
          return null;
        }
      }
      return null;
    },
    retry: false,
    staleTime: 2 * 60 * 1000, // 2 minutes - shorter to refresh role changes
  });

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload(); // Force refresh to clear all state
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <InstallPrompt />
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AutoZar</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to={createPageUrl('Home')} className={`text-sm font-medium ${currentPageName === 'Home' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                Нүүр
              </Link>
              <Link to={createPageUrl('Services')} className={`text-sm font-medium ${currentPageName === 'Services' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                Үйлчилгээ
              </Link>
              {user?.role === 'ADMIN' && (
                <Link to={createPageUrl('Statistics')} className={`text-sm font-medium ${currentPageName === 'Statistics' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                  Статистик
                </Link>
              )}
              {user ? (
                <>
                  <Link to={createPageUrl('LikeGate')} className="text-sm font-medium text-gray-600 hover:text-gray-900">
                    Facebook
                  </Link>
                  <Link to={createPageUrl('Profile')} className={`text-sm font-medium ${currentPageName === 'Profile' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                    Профайл
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link to={createPageUrl('Admin')} className={`text-sm font-medium ${currentPageName === 'Admin' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                      Админ
                    </Link>
                  )}
                  <Link to={createPageUrl('AddCar')} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                    + Зар нэмэх
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Гарах
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="ml-2 bg-blue-600 hover:bg-blue-700 gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Нэвтрэх
                </Button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-4 space-y-3">
              <Link to={createPageUrl('Home')} className="block py-2 text-gray-600" onClick={() => setIsMenuOpen(false)}>
                Нүүр
              </Link>
              <Link to={createPageUrl('Services')} className="block py-2 text-gray-600" onClick={() => setIsMenuOpen(false)}>
                Үйлчилгээ
              </Link>
              {user?.role === 'ADMIN' && (
                <Link to={createPageUrl('Statistics')} className="block py-2 text-gray-600" onClick={() => setIsMenuOpen(false)}>
                  Статистик
                </Link>
              )}
              {user ? (
                <>
                  <Link to={createPageUrl('LikeGate')} className="block py-2 text-gray-600" onClick={() => setIsMenuOpen(false)}>
                    Facebook
                  </Link>
                  <Link to={createPageUrl('Profile')} className="block py-2 text-gray-600" onClick={() => setIsMenuOpen(false)}>
                    Профайл
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link to={createPageUrl('Admin')} className="block py-2 text-gray-600" onClick={() => setIsMenuOpen(false)}>
                      Админ
                    </Link>
                  )}
                  <Link to={createPageUrl('AddCar')} className="block py-2 px-4 bg-blue-600 text-white rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                    + Зар нэмэх
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className="w-full text-left py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Гарах
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
                  className="w-full text-left py-2 px-4 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Нэвтрэх
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
