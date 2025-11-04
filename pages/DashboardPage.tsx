
import React from 'react';
import Card from '../components/ui/Card';
import { useAppContext } from '../hooks/useAppContext';
import MatchCard from '../components/matches/MatchCard';
import { Clock, Star, ShieldCheck } from 'lucide-react';
import type { Match } from '../types';
import { useNavigate } from 'react-router-dom';
import { MatchStatus } from '../types';

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({ icon, label, value, color }) => (
    <Card className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </Card>
);


function DashboardPage() {
    const { user, matches } = useAppContext();
    const navigate = useNavigate();

    if (!user) return <div>Loading...</div>;

    const activeMatches = matches.filter(m => 
        (m.status === MatchStatus.IN_PROGRESS || m.status === MatchStatus.DISPUTED) && 
        [...m.teamA, ...m.teamB].includes(user.id)
    );
    
    const handleViewClick = (match: Match) => {
        navigate(`/matches/${match.id}`);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Welcome back, {user.username}!</h1>
                <p className="text-gray-400 mt-1">Here's what's happening on BetDuel today.</p>
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
                    label="ELO Rating"
                    value={user.elo}
                    color="bg-yellow-500"
                />
            </div>

            <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
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
                        <p className="text-center text-gray-400">You have no active matches.</p>
                    </Card>
                )}
            </div>
        </div>
    );
}

// Dummy Wallet Icon for StatCard
const Wallet: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
);


export default DashboardPage;
