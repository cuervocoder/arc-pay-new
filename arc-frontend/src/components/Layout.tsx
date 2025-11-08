import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Settings, Wallet, Home, Zap, Menu, X } from 'lucide-react';
import { useAuthStore } from '../services/store';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Feed', icon: Home },
    { path: '/history', label: 'History', icon: Wallet },
    { path: '/agent', label: 'Agent', icon: Zap },
    { path: '/preferences', label: 'Preferences', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="font-bold text-xl text-slate-900">Arc Pay</span>
          </Link>

          {user && (
            <>
              <div className="hidden lg:flex items-center gap-4 ml-auto rever">
                <div className="flex items-center justify-center">
                  <img
                    src='/user-3d.jpg'
                    alt="User Avatar"
                    className="w-12 h-12 rounded-full object-cover cursor-pointer hover:shadow-md"
                  />
                  <div className="w-55 p-2">
                    <div className="font-semibold text-slate-900">{user.name}</div>
                    <div className="text-sm text-slate-500">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 hover:bg-slate-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-slate-600" />
                </button>
              </div>
              <div className="lg:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2.5 hover:bg-slate-200 rounded-full">
                  {isMenuOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
                </button>
              </div>
            </>
          )}
        </div>
        {isMenuOpen && (
          <div className="fixed inset-0 bg-white z-50 p-2 lg:hidden">
            <div className="flex justify-end p-4">
              <button onClick={() => setIsMenuOpen(false)} className="p-2.5 hover:bg-slate-200 rounded-full">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <nav className="flex flex-col p-4 gap-2">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive(path)
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </Link>
              ))}
              <div className="border-t border-slate-200 my-2"></div>
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center">
                  <img
                    src='/user-3d.jpg'
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-2">
                    <div className="font-semibold text-slate-900">{user?.name}</div>
                    <div className="text-sm text-slate-500">{user?.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 hover:bg-slate-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block lg:col-span-1">
            <nav className="space-y-2 bg-white rounded-xl p-4 h-fit sticky top-24">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive(path)
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="col-span-1 lg:col-span-3">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
