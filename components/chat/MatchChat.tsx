import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import ChatMessageItem from './ChatMessageItem';
import Card from '../ui/Card';

interface MatchChatProps {
    matchId: string;
}

const MatchChat: React.FC<MatchChatProps> = ({ matchId }) => {
    const { user, messages, sendMessage, markMessagesAsRead } = useAppContext();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const channelMessages = useMemo(() => {
        return messages
            .filter(m => m.channelId === matchId)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [messages, matchId]);

    useEffect(() => {
        markMessagesAsRead(matchId);
    }, [matchId, markMessagesAsRead]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [channelMessages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && user) {
            sendMessage(matchId, newMessage.trim());
            setNewMessage('');
        }
    };
    
    if (!user) return null;

    return (
        <Card>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Match Chat</h2>
            <div className="h-96 bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-y-auto space-y-4 flex flex-col">
                 {channelMessages.length > 0 ? (
                    <div className="flex-grow space-y-4">
                        {channelMessages.map(msg => (
                            <ChatMessageItem
                                key={msg.id}
                                message={msg}
                                isOwnMessage={msg.senderId === user.id}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-gray-500">
                        <p>No messages yet. Be the first to say something!</p>
                    </div>
                )}
            </div>
            <footer className="mt-4">
                <form onSubmit={handleSend} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-grow bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full py-2 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        autoComplete="off"
                    />
                    <button type="submit" className="bg-brand-primary text-white p-3 rounded-full hover:bg-indigo-500 transition-colors disabled:bg-gray-600" disabled={!newMessage.trim()}>
                        <Send size={20} />
                    </button>
                </form>
            </footer>
        </Card>
    );
};

export default MatchChat;