import React from 'react';
import type { ChatMessage } from '../../types';
import { useAppContext } from '../../hooks/useAppContext';

interface ChatMessageItemProps {
    message: ChatMessage;
    isOwnMessage: boolean;
}

const timeFormat = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, isOwnMessage }) => {
    const { allUsers } = useAppContext();
    const sender = allUsers.find(u => u.id === message.senderId);

    if (!sender) return null;

    const alignment = isOwnMessage ? 'items-end' : 'items-start';
    const bubbleColor = isOwnMessage ? 'bg-brand-primary' : 'bg-gray-600';

    return (
        <div className={`flex flex-col ${alignment}`}>
            <div className="flex items-end max-w-[80%]">
                {!isOwnMessage && (
                    <img src={sender.avatarUrl} alt={sender.username} className="w-8 h-8 rounded-full mr-2 self-start"/>
                )}
                <div className={`px-4 py-2 rounded-2xl ${bubbleColor} ${isOwnMessage ? 'rounded-br-none' : 'rounded-bl-none'} text-white`}>
                    {!isOwnMessage && <p className="text-xs font-bold text-gray-300 mb-1">{sender.username}</p>}
                    <p className="text-sm break-words">{message.content}</p>
                </div>
                 {isOwnMessage && (
                    <img src={sender.avatarUrl} alt={sender.username} className="w-8 h-8 rounded-full ml-2 self-start"/>
                )}
            </div>
             <p className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'mr-12' : 'ml-12'}`}>{timeFormat(message.timestamp)}</p>
        </div>
    );
};

export default ChatMessageItem;
