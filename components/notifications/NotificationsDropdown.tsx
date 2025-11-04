import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import NotificationItem from './NotificationItem';
import { BellOff } from 'lucide-react';

interface NotificationsDropdownProps {
  onClose: () => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ onClose }) => {
  const { notifications, markAllNotificationsAsRead } = useAppContext();
  
  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-80 max-w-sm bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50 flex flex-col max-h-[70vh]">
      <div className="flex justify-between items-center p-3 border-b border-gray-700">
        <h3 className="font-bold text-white text-lg">Notifications</h3>
        <button 
          onClick={handleMarkAllRead}
          className="text-sm text-brand-primary hover:underline"
          disabled={notifications.every(n => n.read)}
        >
          Mark all as read
        </button>
      </div>
      <div className="overflow-y-auto">
        {notifications.length > 0 ? (
          <div>
            {notifications.map(notification => (
              <NotificationItem key={notification.id} notification={notification} onClose={onClose} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 text-gray-400">
            <BellOff className="h-12 w-12 mx-auto text-gray-500 mb-4" />
            <p>You have no notifications.</p>
          </div>
        )}
      </div>
       <div className="p-2 text-center border-t border-gray-700">
        <button className="text-sm font-medium text-gray-400 hover:text-white w-full">
            View All Notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationsDropdown;