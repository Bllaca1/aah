import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAppContext } from '../hooks/useAppContext';
import { User } from '../types';
import { Users, UserPlus, Send, Check, X, Trash2 } from 'lucide-react';
import PresenceIndicator from '../components/ui/PresenceIndicator';

type Tab = 'friends' | 'incoming' | 'sent';

const UserCard: React.FC<{ user: User, children?: React.ReactNode }> = ({ user, children }) => {
    // Fix: Explicitly typed the `reduce` function's accumulator and current value to resolve a TypeScript error with arithmetic operations.
    const overallElo = Object.values(user.elo).length > 0 ? Math.round(Object.values(user.elo).reduce((a: number, b: number) => a + b, 0) / Object.values(user.elo).length) : 1500;
    return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg space-y-3 sm:space-y-0">
        <Link to={`/users/${user.username}`} className="flex items-center space-x-4 group">
            <div className="relative flex-shrink-0">
                <img src={user.avatarUrl} alt={user.username} className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover:border-brand-primary transition-colors"/>
                <div className="absolute bottom-0 right-0">
                    <PresenceIndicator status={user.status} />
                </div>
            </div>
            <div>
                <p className="font-bold text-gray-900 dark:text-white group-hover:underline">{user.username}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">ELO: {overallElo}</p>
            </div>
        </Link>
        <div className="flex space-x-2 justify-end">
            {children}
        </div>
    </div>
);
};

function FriendsPage() {
    const { user, allUsers, acceptFriendRequest, rejectFriendRequest, removeFriend } = useAppContext();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const initialTab = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState<Tab>(initialTab === 'incoming' || initialTab === 'sent' ? initialTab : 'friends');

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'friends' || tab === 'incoming' || tab === 'sent') {
            setActiveTab(tab);
        }
    }, [searchParams]);

    if (!user) return null;

    const myFriends = useMemo(() => allUsers.filter(u => user.friends.includes(u.id)), [allUsers, user.friends]);
    const incomingRequests = useMemo(() => allUsers.filter(u => user.friendRequests.received.includes(u.id)), [allUsers, user.friendRequests.received]);
    const sentRequests = useMemo(() => allUsers.filter(u => user.friendRequests.sent.includes(u.id)), [allUsers, user.friendRequests.sent]);

    const handleTabClick = (tab: Tab) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    const renderTabContent = () => {
        let list: User[] = [];
        let emptyMessage = "";
        let content: React.ReactNode;

        switch (activeTab) {
            case 'friends':
                list = myFriends;
                emptyMessage = "You haven't added any friends yet. Use the search to find players!";
                content = list.map(friend => (
                    <UserCard key={friend.id} user={friend}>
                        <Button variant="danger" onClick={() => removeFriend(friend.id)}>
                            <Trash2 className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">Unfriend</span>
                        </Button>
                    </UserCard>
                ));
                break;
            case 'incoming':
                list = incomingRequests;
                emptyMessage = "No pending friend requests.";
                 content = list.map(requester => (
                    <UserCard key={requester.id} user={requester}>
                        <Button variant="secondary" onClick={() => rejectFriendRequest(requester.id)}>
                            <X className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">Decline</span>
                        </Button>
                        <Button onClick={() => acceptFriendRequest(requester.id)}>
                            <Check className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">Accept</span>
                        </Button>
                    </UserCard>
                ));
                break;
            case 'sent':
                list = sentRequests;
                emptyMessage = "You haven't sent any friend requests.";
                content = list.map(recipient => (
                    <UserCard key={recipient.id} user={recipient}>
                        <Button variant="secondary" disabled>Request Sent</Button>
                    </UserCard>
                ));
                break;
        }

        if (list.length === 0) {
            return <div className="text-center py-16 text-gray-500 dark:text-gray-400">{emptyMessage}</div>;
        }
        return <div className="space-y-3">{content}</div>;
    };
    
    const TabButton: React.FC<{tab: Tab, icon: React.ReactNode, label: string, count: number}> = ({tab, icon, label, count}) => (
        <button
            onClick={() => handleTabClick(tab)}
            className={`flex items-center justify-center w-full px-2 sm:px-4 py-3 font-semibold text-sm transition-colors duration-200 border-b-2 ${activeTab === tab ? 'text-brand-primary border-brand-primary' : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-500'}`}
        >
            {icon} <span className="ml-2 hidden sm:inline">{label}</span>
            {count > 0 && <span className="ml-2 bg-gray-200 dark:bg-gray-700 text-brand-primary text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>}
        </button>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Friends</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your friends and friend requests.</p>
            </div>
            
            <Card className="!p-0">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <TabButton tab="friends" icon={<Users size={18} />} label="My Friends" count={myFriends.length} />
                    <TabButton tab="incoming" icon={<UserPlus size={18} />} label="Incoming" count={incomingRequests.length} />
                    <TabButton tab="sent" icon={<Send size={18} />} label="Sent" count={sentRequests.length} />
                </div>
                <div className="p-2 sm:p-6">
                    {renderTabContent()}
                </div>
            </Card>
        </div>
    );
}

export default FriendsPage;