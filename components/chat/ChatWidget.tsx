import React, { useState, useMemo } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import ChatWindow from './ChatWindow';
import type { User, Match, ChatChannel } from '../../types';
import PresenceIndicator from '../ui/PresenceIndicator';
import { GAMES } from '../../constants';

interface ChannelListItemProps {
    channel: ChatChannel;
    onSelect: () => void;
    isUnread: boolean;
    user: User;
    allUsers: User[];
    matches: Match[];
}

const ChannelListItem: React.FC<ChannelListItemProps> = ({ channel, onSelect, isUnread, user, allUsers, matches }) => {
    const { name, imageUrl, status } = useMemo(() => {
        if (channel.type === 'DM') {
            const friendId = channel.participantIds.find(id => id !== user.id);
            const friend = allUsers.find(u => u.id === friendId);
            return { name: friend?.username || 'Unknown User', imageUrl: friend?.avatarUrl, status: friend?.status };
        } else {
            const match = matches.find(m => m.id === channel.id);
            const game = GAMES.find(g => g.id === match?.game.id);
            return { name: match ? `${game?.name} Match` : 'Match Chat', imageUrl: game?.imageUrl, status: undefined };
        }
    }, [channel, user, allUsers, matches]);
    
    return (
        <li onClick={onSelect} className="flex items-center p-3 hover:bg-gray-700/50 cursor-pointer rounded-lg transition-colors">
            <div className="relative mr-3 flex-shrink-0">
                <img src={imageUrl} alt={name} className="w-12 h-12 rounded-full object-cover" />
                {status && <div className="absolute bottom-0 right-0"><PresenceIndicator status={status} /></div>}
            </div>
            <div className="flex-grow overflow-hidden">
                <div className="flex justify-between items-center">
                    <p className="font-bold text-white truncate">{name}</p>
                    {isUnread && <span className="h-3 w-3 bg-brand-primary rounded-full flex-shrink-0 ml-2"></span>}
                </div>
                <p className="text-sm text-gray-400 truncate">{channel.lastMessage?.content || 'No messages yet'}</p>
            </div>
        </li>
    );
};

const ChatWidget: React.FC = () => {
    const { user, allUsers, matches, channels } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

    const totalUnreadCount = useMemo(() => {
        if (!user) return 0;
        return channels.reduce((count, channel) => {
            const isUnread = channel.lastMessage && !channel.lastMessage.readBy.includes(user.id);
            return isUnread ? count + 1 : count;
        }, 0);
    }, [channels, user]);

    if (!user) return null;

    const handleSelectChannel = (channelId: string) => {
        // Set the active channel. The list will hide based on this state change.
        setActiveChannelId(channelId);
    };

    const handleCloseWindow = () => {
        // Reset the entire widget to its closed state.
        setActiveChannelId(null);
        setIsOpen(false);
    };

    return (
        <>
            {activeChannelId && (
                <div className="fixed bottom-0 right-24 z-50">
                     <ChatWindow channelId={activeChannelId} onClose={handleCloseWindow} />
                </div>
            )}

            <div className="fixed bottom-5 right-5 z-40">
                {!activeChannelId && (
                     <button onClick={() => setIsOpen(!isOpen)} className="bg-brand-primary text-white rounded-full p-4 shadow-lg hover:bg-indigo-500 transition-transform hover:scale-110">
                        <MessageSquare className="h-8 w-8" />
                        {totalUnreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-6 w-6">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500 text-white text-sm items-center justify-center">{totalUnreadCount}</span>
                            </span>
                        )}
                    </button>
                )}
                
                {isOpen && !activeChannelId && (
                    <div className="absolute bottom-full right-0 mb-3 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl flex flex-col max-h-[60vh]">
                         <div className="flex justify-between items-center p-3 border-b border-gray-700">
                            <h3 className="font-bold text-white text-lg">Chats</h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <ul className="overflow-y-auto p-2 space-y-1">
                            {[...channels].sort((a,b) => new Date(b.lastMessage?.timestamp || 0).getTime() - new Date(a.lastMessage?.timestamp || 0).getTime()).map(channel => (
                                <ChannelListItem
                                    key={channel.id}
                                    channel={channel}
                                    onSelect={() => handleSelectChannel(channel.id)}
                                    isUnread={!!channel.lastMessage && !channel.lastMessage.readBy.includes(user.id)}
                                    user={user}
                                    allUsers={allUsers}
                                    matches={matches}
                                />
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </>
    );
};

export default ChatWidget;