import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, User as UserIcon, FileText, Target, MessageSquare, BookOpen, Settings as SettingsIcon, LogOut, Menu, X } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/profile', label: 'Profile', icon: UserIcon },
    { path: '/resume', label: 'Resume Parser', icon: FileText },
    { path: '/matches', label: 'Internships', icon: Target },
    { path: '/interview', label: 'Mock Interview', icon: MessageSquare },
    { path: '/documents', label: 'Document Q&A', icon: BookOpen },
    { path: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full flex items-center p-3 rounded-lg transition-colors ${
              isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Icon size={20} className={`mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">CareerMatch</h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-500 hover:text-gray-700">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar (Desktop & Mobile) */}
      <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex w-full md:w-64 bg-white border-r border-gray-200 flex-col fixed md:relative z-10 h-[calc(100vh-61px)] md:h-screen`}>
        <div className="hidden md:block p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-blue-600">CareerMatch</h1>
          <p className="text-sm text-gray-500 truncate mt-1">{user?.email}</p>
        </div>
        <div className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavLinks />
        </div>
        <div className="p-4 border-t border-gray-200">
          <button onClick={logout} className="w-full flex items-center p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={20} className="mr-3" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto w-full">
        <main className="p-4 sm:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
