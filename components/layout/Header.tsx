import React, { useState, useEffect, useRef } from 'react';
import { Bell, PlusCircle, LogOut, Menu } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { useNavigate } from 'react-router-dom';
import NotificationsDropdown from '../notifications/NotificationsDropdown';

interface HeaderProps {
  onMobileMenuClick: () => void;
}

function Header({ onMobileMenuClick }: HeaderProps) {
  const { user, logout, notifications } = useAppContext();
  const navigate = useNavigate();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  return (
    <header className="flex-shrink-0 bg-gray-800 border-b border-gray-700">
      <div className="flex items-center justify-between p-4">
        <div className="md:hidden">
          <button onClick={onMobileMenuClick} className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700" aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <div/>
        <div className="flex items-center space-x-4">
           <button 
            onClick={() => navigate('/wallet')}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-brand-primary text-white font-semibold py-2 px-4 border border-gray-600 rounded-lg shadow transition-all duration-200"
          >
            <span className="font-mono text-green-400">{user.credits.toFixed(2)} C</span>
            <PlusCircle className="h-5 w-5 text-gray-300" />
          </button>
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(prev => !prev)}
              className="p-2 rounded-full hover:bg-gray-700 relative"
            >
              <Bell className="h-6 w-6 text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] ring-2 ring-gray-800 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {isDropdownOpen && <NotificationsDropdown onClose={() => setDropdownOpen(false)} />}
          </div>
          <div className="flex items-center">
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={user.avatarUrl}
              alt={user.username}
            />
            <div className="ml-3 hidden md:block">
              <p className="text-sm font-medium text-white">{user.username}</p>
              <p className="text-xs text-gray-400">ELO: {user.elo}</p>
            </div>
            <button onClick={logout} className="p-2 rounded-full hover:bg-gray-700 ml-2" title="Log Out">
              <LogOut className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;