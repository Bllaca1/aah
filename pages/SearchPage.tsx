import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Star } from 'lucide-react';
import Card from '../components/ui/Card';
import type { User } from '../types';
import PresenceIndicator from '../components/ui/PresenceIndicator';

const UserSearchResultCard: React.FC<{ user: User }> = ({ user }) => {
    // Fix: Explicitly typed the `reduce` function's accumulator and current value to resolve a TypeScript error with arithmetic operations.
    const overallElo = Object.values(user.elo).length > 0
        ? Math.round(Object.values(user.elo).reduce((a: number, b: number) => a + b, 0) / Object.values(user.elo).length)
        : 1500; // Default ELO

    return (
    <Link to={`/users/${user.username}`} className="block hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200 rounded-lg">
        <Card className="!p-4 flex items-center space-x-4">
            <div className="relative flex-shrink-0">
                <img src={user.avatarUrl} alt={user.username} className="w-16 h-16 rounded-full border-2 border-gray-300 dark:border-gray-600"/>
                <div className="absolute bottom-0 right-0">
                    <PresenceIndicator status={user.status} />
                </div>
            </div>
            <div className="flex-grow">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{user.username}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span className="flex items-center"><ShieldCheck className="w-4 h-4 mr-1 text-yellow-500" /> ELO: {overallElo}</span>
                    <span className="flex items-center"><Star className="w-4 h-4 mr-1 text-brand-primary" /> Rating: {user.rating}</span>
                </div>
            </div>
        </Card>
    </Link>
);
};


function SearchPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const { allUsers } = useAppContext(); // Using stateful user list

    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) {
            return [];
        }
        return allUsers.filter(user => 
            user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, allUsers]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Search Players</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Find any player on the BetDuel platform.</p>
            </div>
            
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500"/>
                <input
                    type="text"
                    placeholder="Search by username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg py-3 pr-4 pl-12 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
            </div>

            <div className="space-y-4">
                {searchTerm && filteredUsers.length > 0 && (
                    filteredUsers.map(user => (
                        <UserSearchResultCard key={user.id} user={user} />
                    ))
                )}
                {searchTerm && filteredUsers.length === 0 && (
                    <Card className="text-center text-gray-500 dark:text-gray-400 py-10">
                        No players found for "{searchTerm}".
                    </Card>
                )}
                 {!searchTerm && (
                    <Card className="text-center text-gray-500 dark:text-gray-400 py-10">
                        <Search className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4"/>
                        <p>Start typing to search for a player.</p>
                    </Card>
                )}
            </div>
        </div>
    );
}

// Import useAppContext to get the most up-to-date user data
import { useAppContext } from '../hooks/useAppContext';
export default SearchPage;