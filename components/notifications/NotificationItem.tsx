import React from 'react';
import { Link } from 'react-router-dom';
import type { Notification } from '../../types';
import { NotificationType } from '../../types';
import { UserPlus, Swords, ShieldAlert, Ban, Info, UserCheck, Shield } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import Button from '../ui/Button';

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
}

const NOTIFICATION_ICONS: { [key in NotificationType]: React.ReactNode } = {
  [NotificationType.FRIEND_REQUEST]: <UserPlus className="h-5 w-5 text-blue-400" />,
  [NotificationType.FRIEND_REQUEST_ACCEPTED]: <UserCheck className="h-5 w-5 text-green-400" />,
  [NotificationType.MATCH_INVITE]: <Swords className="h-5 w-5 text-red-400" />,
  [NotificationType.MATCH_LOBBY_INVITE]: <Swords className="h-5 w-5 text-purple-500 dark:text-purple-400" />,
  [NotificationType.DISPUTE_UPDATE]: <ShieldAlert className="h-5 w-5 text-yellow-400" />,
  [NotificationType.BLOCKED_INTERACTION]: <Ban className="h-5 w-5 text-gray-500" />,
  [NotificationType.GENERIC]: <Info className="h-5 w-5 text-purple-500 dark:text-purple-400" />,
  [NotificationType.TEAM_INVITE]: <Shield className="h-5 w-5 text-cyan-400" />,
  [NotificationType.TEAM_INVITE_ACCEPTED]: <Shield className="h-5 w-5 text-green-400" />,
};

// Simple time ago function
const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "just now";
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose }) => {
    const { user, markNotificationAsRead, acceptFriendRequest, rejectFriendRequest, acceptTeamInvite, rejectTeamInvite } = useAppContext();
    
    const handleAcceptFriend = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (notification.sender) {
            acceptFriendRequest(notification.sender.id);
        }
        onClose();
    };

    const handleDeclineFriend = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (notification.sender) {
            rejectFriendRequest(notification.sender.id);
        }
    };

    const handleAcceptTeam = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (notification.meta?.teamId) {
            acceptTeamInvite(notification.meta.teamId);
        }
        onClose();
    };

    const handleDeclineTeam = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (notification.meta?.teamId) {
            rejectTeamInvite(notification.meta.teamId);
        }
    };
    
    const content = (
        <div 
            onClick={() => {
                if (!notification.read) markNotificationAsRead(notification.id);
                if (notification.linkTo) onClose();
            }}
            className="flex items-start p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0"
        >
            <div className="flex-shrink-0 mr-4 mt-1">
                {notification.sender ? (
                    <img src={notification.sender.avatarUrl} alt={notification.sender.username} className="h-8 w-8 rounded-full" />
                ) : (
                    <div className="h-8 w-8 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded-full">
                        {NOTIFICATION_ICONS[notification.type]}
                    </div>
                )}
            </div>
            <div className="flex-grow">
                 <p className="text-sm text-gray-600 dark:text-gray-300">
                    {notification.sender && <span className="font-bold text-gray-900 dark:text-white">{notification.sender.username}</span>} {notification.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{timeAgo(notification.timestamp)}</p>

                {notification.type === NotificationType.FRIEND_REQUEST && !notification.read && notification.sender && (
                  <div className="mt-2 flex space-x-2">
                    <Button variant="primary" className="!px-3 !py-1 !text-xs" onClick={handleAcceptFriend}>Accept</Button>
                    <Button variant="secondary" className="!px-3 !py-1 !text-xs" onClick={handleDeclineFriend}>Decline</Button>
                  </div>
                )}
                
                {notification.type === NotificationType.TEAM_INVITE && !notification.read && notification.meta?.teamId && (
                  <div className="mt-2 flex space-x-2">
                    <Button 
                      variant="primary" 
                      className="!px-3 !py-1 !text-xs" 
                      onClick={handleAcceptTeam}
                      disabled={!!user?.teamId}
                      title={user?.teamId ? "You're already on a team" : "Accept"}
                    >
                      Accept
                    </Button>
                    <Button variant="secondary" className="!px-3 !py-1 !text-xs" onClick={handleDeclineTeam}>Decline</Button>
                  </div>
                )}
            </div>
            {!notification.read && (
                 <div className="flex-shrink-0 ml-3 mt-1">
                    <span className="block h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                </div>
            )}
        </div>
    );

    if (notification.linkTo) {
        return <Link to={notification.linkTo}>{content}</Link>
    }

    return content;
};

export default NotificationItem;