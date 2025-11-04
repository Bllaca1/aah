import React, { useState, useMemo } from 'react';
import type { Team, User } from '../../types';
import { useAppContext } from '../../hooks/useAppContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Send } from 'lucide-react';
import PresenceIndicator from '../ui/PresenceIndicator';

interface InviteFriendsModalProps {
    isOpen: boolean;
    onClose: () => void;
    team: Team;
}

const FriendSelectItem: React.FC<{
    friend: User;
    isSelected: boolean;
    onToggle: (id: string) => void;
}> = ({ friend, isSelected, onToggle }) => (
    <div 
        onClick={() => onToggle(friend.id)}
        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-brand-primary/20 ring-2 ring-brand-primary' : 'bg-gray-700/50 hover:bg-gray-700'}`}
    >
         <div className="flex items-center space-x-4">
            <div className="relative flex-shrink-0">
                <img src={friend.avatarUrl} alt={friend.username} className="w-10 h-10 rounded-full border-2 border-gray-600"/>
                <div className="absolute bottom-0 right-0">
                    <PresenceIndicator status={friend.status} size="sm" />
                </div>
            </div>
            <div>
                <p className="font-semibold text-white">{friend.username}</p>
                <p className="text-xs text-gray-400">ELO: {friend.elo}</p>
            </div>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-brand-primary border-brand-primary' : 'border-gray-500'}`}>
            {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
        </div>
    </div>
);

const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({ isOpen, onClose, team }) => {
    const { user, allUsers, inviteToTeam } = useAppContext();
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
    
    const availableFriends = useMemo(() => {
        if (!user) return [];
        return user.friends
            .map(id => allUsers.find(u => u.id === id))
            .filter((friend): friend is User => !!friend && !friend.teamId && !team.members.includes(friend.id));
    }, [user, allUsers, team]);

    const handleToggle = (friendId: string) => {
        setSelectedFriends(prev => 
            prev.includes(friendId)
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
    };

    const handleSendInvites = () => {
        if (selectedFriends.length > 0) {
            inviteToTeam(team.id, selectedFriends);
        }
        onClose();
        setSelectedFriends([]);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Invite Friends to ${team.name}`}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button 
                        onClick={handleSendInvites} 
                        disabled={selectedFriends.length === 0}
                    >
                        <Send className="h-4 w-4 mr-2" />
                        Send {selectedFriends.length > 0 ? selectedFriends.length : ''} Invite(s)
                    </Button>
                </>
            }
        >
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {availableFriends.length > 0 ? (
                    availableFriends.map(friend => (
                        <FriendSelectItem
                            key={friend.id}
                            friend={friend}
                            isSelected={selectedFriends.includes(friend.id)}
                            onToggle={handleToggle}
                        />
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-400">
                        <p>All of your friends are already on a team or have been invited.</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default InviteFriendsModal;