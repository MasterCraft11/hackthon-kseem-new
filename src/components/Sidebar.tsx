import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, BookOpen, PlusCircle, Settings, LogOut, User, Menu, X } from 'lucide-react';

interface SidebarProps {
  activeView: 'dashboard' | 'upload' | 'study';
  onNavigate: (view: 'dashboard' | 'upload' | 'study') => void;
  onLogout: () => void;
  userEmail: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, onLogout, userEmail }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'study', label: 'My Decks', icon: <BookOpen size={20} /> },
    { id: 'upload', label: 'Create New', icon: <PlusCircle size={20} /> },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-6 left-6 z-[60] p-3 bg-surface-container-low rounded-xl text-on-surface shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface-container border-r border-white/5 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 primary-gradient rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BookOpen className="text-white" size={24} />
            </div>
            <span className="text-xl font-black font-headline tracking-tight text-on-surface">CodeCraft</span>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id as any);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all ${
                  activeView === item.id 
                    ? 'bg-primary text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="space-y-6 pt-8 border-t border-white/5">
            <div className="flex items-center gap-4 px-4">
              <div className="w-10 h-10 bg-surface-container-low rounded-full flex items-center justify-center text-on-surface-variant">
                <User size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-on-surface truncate">{userEmail.split('@')[0]}</p>
                <p className="text-xs text-on-surface-variant truncate">{userEmail}</p>
              </div>
            </div>

            <div className="space-y-2">
              <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all">
                <Settings size={20} />
                Settings
              </button>
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-accent-red hover:bg-accent-red/10 transition-all"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      )}
    </>
  );
};
