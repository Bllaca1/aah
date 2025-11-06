import React, { useState } from 'react';
import { UserPlus, Plus, LogOut } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import type { User } from '../../types';
import Button from '../ui/Button';
import InviteFriendsModal from '../teams/InviteFriendsModal';

const PartySlot: React.FC<{ member?: User, onInvite?: () => void, isCaptain: boolean }> = ({ member, onInvite, isCaptain }) => {
    if (member) {
        return (
            <div className="relative group">
                <img src={member.avatarUrl} alt={member.username} className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600"/>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {member.username}
                </div>
            </div>
        );
    }

    return (
        <button 
            onClick={onInvite} 
            disabled={!isCaptain} 
            className="w-10 h-10 rounded-full border-2 border-dashed border-gray-400 dark:border-gray-500 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:border-brand-primary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-400 disabled:hover:text-gray-400 transition-colors"
            aria-label="Invite player"
        >
            <Plus className="h-5 w-5" />
        </button>
    );
};


const PartyControls: React.FC = () => {
    const { user, teams, allUsers, createTeam, leaveTeam, disbandTeam } = useAppContext();
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);

    if (!user) return null;

    const myParty = teams.find(t => t.id === user.teamId);

    const handleDisbandOrLeave = () => {
        if (myParty) {
            if (myParty.captainId === user.id) {
                disbandTeam(myParty.id);
            } else {
                leaveTeam(myParty.id);
            }
        }
    }

    if (!myParty) {
        return (
            <Button onClick={createTeam} className="!py-2 !px-3 hidden sm:flex">
                <UserPlus className="h-5 w-5 mr-2" />
                Create Party
            </Button>
        );
    }
    
    const members = myParty.members.map(id => allUsers.find(u => u.id === id)).filter(Boolean) as User[];
    const isCaptain = myParty.captainId === user.id;

    return (
        <>
            <div className="hidden sm:flex items-center space-x-1 sm:space-x-2 bg-gray-100 dark:bg-gray-900/50 p-1 rounded-full">
                {Array.from({ length: 5 }).map((_, i) => (
                    <PartySlot 
                        key={i} 
                        member={members[i]} 
                        onInvite={() => setInviteModalOpen(true)}
                        isCaptain={isCaptain}
                    />
                ))}
                <button 
                    onClick={handleDisbandOrLeave} 
                    className="p-2 rounded-full text-red-500 hover:bg-red-500/10 transition-colors"
                    title={isCaptain ? "Disband Party" : "Leave Party"}
                >
                    <LogOut className="h-5 w-5" />
                </button>
            </div>
            {isCaptain && (
                <InviteFriendsModal
                    isOpen={isInviteModalOpen}
                    onClose={() => setInviteModalOpen(false)}
                    team={myParty}
                />
            )}
        </>
    );
};

export default PartyControls;