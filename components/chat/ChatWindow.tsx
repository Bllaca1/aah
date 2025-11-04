import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import ChatMessageItem from './ChatMessageItem';
import PresenceIndicator from '../ui/PresenceIndicator';
import { GAMES } from '../../constants';

interface ChatWindowProps {
    channelId: string;
    onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ channelId, onClose }) => {
    const { user, allUsers, matches, messages, sendMessage, markMessagesAsRead } = useAppContext();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const channelMessages = useMemo(() => {
        return messages
            .filter(m => m.channelId === channelId)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [messages, channelId]);

    const { name, imageUrl, status } = useMemo(() => {
        const channel = useAppContext().channels.find(c => c.id === channelId);
        if (!channel || !user) return { name: 'Chat', imageUrl: '', status: undefined };

        if (channel.type === 'DM') {
            const friendId = channel.participantIds.find(id => id !== user.id);
            const friend = allUsers.find(u => u.id === friendId);
            return { name: friend?.username || 'Unknown User', imageUrl: friend?.avatarUrl, status: friend?.status };
        } else {
            const match = matches.find(m => m.id === channel.id);
            const game = GAMES.find(g => g.id === match?.game.id);
            return { name: match ? `${game?.name} Match` : 'Match Chat', imageUrl: game?.imageUrl, status: undefined };
        }
    }, [channelId, allUsers, matches, user]);

    useEffect(() => {
        markMessagesAsRead(channelId);
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [channelId, markMessagesAsRead, channelMessages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && user) {
            sendMessage(channelId, newMessage.trim());
            setNewMessage('');
        }
    };
    
    if (!user) return null;

    return (
        <div className="w-96 h-[30rem] bg-gray-800 border border-gray-700 rounded-t-lg shadow-2xl flex flex-col">
            <header className="flex items-center justify-between p-3 border-b border-gray-700 flex-shrink-0">
                <div className="flex items-center">
                    <div className="relative mr-3">
                         <img src={imageUrl} alt={name} className="w-10 h-10 rounded-full object-cover" />
                         {status && <div className="absolute bottom-0 right-0"><PresenceIndicator status={status} size="sm" /></div>}
                    </div>
                    <h3 className="font-bold text-white">{name}</h3>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700">
                    <X size={20} />
                </button>
            </header>
            
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {channelMessages.map(msg => (
                    <ChatMessageItem
                        key={msg.id}
                        message={msg}
                        isOwnMessage={msg.senderId === user.id}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            <footer className="p-3 border-t border-gray-700 flex-shrink-0">
                <form onSubmit={handleSend} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-grow bg-gray-700 border border-gray-600 rounded-full py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        autoComplete="off"
                    />
                    <button type="submit" className="bg-brand-primary text-white p-3 rounded-full hover:bg-indigo-500 transition-colors disabled:bg-gray-600" disabled={!newMessage.trim()}>
                        <Send size={20} />
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default ChatWindow;
