import React from 'react';
import Card from '../components/ui/Card';
import { useAppContext } from '../hooks/useAppContext';
import MatchCard from '../components/matches/MatchCard';
import { Clock, Star, ShieldCheck, Wallet } from 'lucide-react';
import type { Match } from '../types';
import { useNavigate } from 'react-router-dom';
import { MatchStatus } from '../types';

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({ icon, label, value, color }) => (
    <Card className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </Card>
);


function DashboardPage() {
    const { user, matches } = useAppContext();
    const navigate = useNavigate();

    if (!user) return <div>Loading...</div>;
    
    // Fix: Explicitly typed the `reduce` function's accumulator and current value to resolve a TypeScript error with arithmetic operations.
    const overallElo = Object.values(user.elo).length > 0 ? Math.round(Object.values(user.elo).reduce((a: number, b: number) => a + b, 0) / Object.values(user.elo).length) : 1500;

    const activeMatches = matches.filter(m => 
        (m.status === MatchStatus.IN_PROGRESS || m.status === MatchStatus.DISPUTED || m.status === MatchStatus.AWAITING_ADMIN_REVIEW || m.status === MatchStatus.AWAITING_OPPONENT_EVIDENCE) && 
        [...m.teamA, ...m.teamB].includes(user.id)
    );
    
    const handleViewClick = (match: Match) => {
        navigate(`/matches/${match.id}`);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user.username}!</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening on BetDuel today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <StatCard 
                    icon={<Wallet className="h-6 w-6 text-white" />}
                    label="Credit Balance"
                    value={`${user.credits.toFixed(2)} C`}
                    color="bg-green-500"
                />
                 <StatCard 
                    icon={<Star className="h-6 w-6 text-white" />}
                    label="User Rating"
                    value={user.rating}
                    color="bg-brand-primary"
                />
                 <StatCard 
                    icon={<ShieldCheck className="h-6 w-6 text-white" />}
                    label="Overall ELO"
                    value={overallElo}
                    color="bg-yellow-500"
                />
            </div>

            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Clock className="mr-3 h-6 w-6 text-brand-primary" />
                    Your Active Matches
                </h2>
                {activeMatches.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {activeMatches.map((match: Match) => (
                            <MatchCard key={match.id} match={match} onViewClick={handleViewClick} />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <p className="text-center text-gray-500 dark:text-gray-400">You have no active matches.</p>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default DashboardPage;