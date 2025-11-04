import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Swords, UserCircle, Wallet, Settings, ShieldAlert, X, Search, Users, Shield } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { UserRole } from '../../types';

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string; onClick?: () => void }> = ({ to, icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-brand-primary text-white'
          : 'text-gray-400 hover:bg-gray-700 hover:text-white'
      }`
    }
  >
    {icon}
    <span className="ml-4">{label}</span>
  </NavLink>
);

const SidebarContent: React.FC<{ onLinkClick?: () => void }> = ({ onLinkClick }) => {
    const { user } = useAppContext();
    return (
        <>
            <div>
                <div className="flex items-center mb-10 px-2">
                <Swords className="h-8 w-8 text-brand-primary" />
                <h1 className="text-2xl font-bold text-white ml-2">BetDuel</h1>
                </div>
                <nav className="space-y-2">
                <NavItem to="/dashboard" icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" onClick={onLinkClick} />
                <NavItem to="/matches" icon={<Swords className="h-5 w-5" />} label="Matches" onClick={onLinkClick} />
                <NavItem to="/search" icon={<Search className="h-5 w-5" />} label="Search Players" onClick={onLinkClick} />
                <NavItem to="/friends" icon={<Users className="h-5 w-5" />} label="Friends" onClick={onLinkClick} />
                <NavItem to="/team" icon={<Shield className="h-5 w-5" />} label="My Team" onClick={onLinkClick} />
                <NavItem to="/profile" icon={<UserCircle className="h-5 w-5" />} label="Profile" onClick={onLinkClick} />
                <NavItem to="/wallet" icon={<Wallet className="h-5 w-5" />} label="Wallet" onClick={onLinkClick} />
                {user?.role === UserRole.ADMIN && (
                    <div className="pt-4 mt-4 border-t border-gray-700">
                    <NavItem to="/admin/disputes" icon={<ShieldAlert className="h-5 w-5" />} label="Disputes" onClick={onLinkClick} />
                    </div>
                )}
                </nav>
            </div>
            <div>
                <NavItem to="/settings" icon={<Settings className="h-5 w-5" />} label="Settings" onClick={onLinkClick} />
            </div>
        </>
    )
}

interface SidebarProps {
    isMobileOpen: boolean;
    setMobileOpen: (isOpen: boolean) => void;
}

function Sidebar({ isMobileOpen, setMobileOpen }: SidebarProps) {
  const handleClose = () => setMobileOpen(false);
  
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-gray-800 p-4 hidden md:flex md:flex-col justify-between">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-40 md:hidden ${isMobileOpen ? 'block' : 'hidden'}`}>
        {/* Overlay */}
        <div 
            className="fixed inset-0 bg-black bg-opacity-60"
            onClick={handleClose}
            aria-hidden="true"
        ></div>
        
        {/* Sidebar Panel */}
        <aside 
            className={`fixed top-0 left-0 bottom-0 flex flex-col justify-between w-64 bg-gray-800 p-4 z-50 transform transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sidebar-title"
        >
            <div className="absolute top-2 right-2">
                <button onClick={handleClose} className="p-2 text-gray-400 hover:text-white">
                    <span className="sr-only">Close menu</span>
                    <X className="h-6 w-6" />
                </button>
            </div>
            <SidebarContent onLinkClick={handleClose}/>
        </aside>
      </div>
    </>
  );
}

export default Sidebar;