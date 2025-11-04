import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { MatchStatus } from '../types';
import type { Match, User } from '../types';
import { ShieldAlert, RefreshCw, Trophy } from 'lucide-react';

function AdminDisputesPage() {
    const { matches, allUsers, updateMatch, updateUserById } = useAppContext();

    const disputedMatches = matches.filter(m => m.status === MatchStatus.DISPUTED);

    const handleRefund = (matchId: string) => {
        console.log(`Admin refunding match ${matchId}`);
        updateMatch(matchId, { status: MatchStatus.REFUNDED });
    };

    const handleSettle = (match: Match, winnerId: string) => {
        const winnerTeam = match.teamA.includes(winnerId) ? 'A' : 'B';
        const loserTeamIds = winnerTeam === 'A' ? match.teamB : match.teamA;
        
        loserTeamIds.forEach(loserId => {
            const loserData = allUsers.find(u => u.id === loserId);
            if(loserData) {
                const newRating = Math.max(0, loserData.rating - 25);
                console.log(`Penalizing ${loserData.username}. Old rating: ${loserData.rating}, New rating: ${newRating}`);
                updateUserById(loserId, { rating: newRating });
            }
        });
        
        console.log(`Admin settling match ${match.id}, winner team: ${winnerTeam}`);
        updateMatch(match.id, { status: MatchStatus.COMPLETED, winnerTeam });
    };


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center">
                    <ShieldAlert className="h-8 w-8 mr-3 text-red-400" />
                    Manage Disputes
                </h1>
                <p className="text-gray-400 mt-1">Review and resolve active match disputes.</p>
            </div>

            <Card>
                {disputedMatches.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-700 text-sm text-gray-400">
                                    <th className="py-2 px-4">Match ID</th>
                                    <th className="py-2 px-4">Players</th>
                                    <th className="py-2 px-4">Wager</th>
                                    <th className="py-2 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {disputedMatches.map((match: Match) => {
                                    const playerIds = [...match.teamA, ...match.teamB];
                                    const players = playerIds.map(id => allUsers.find(u => u.id === id)).filter(Boolean) as User[];
                                    
                                    return (
                                    <tr key={match.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                        <td className="py-3 px-4 font-mono text-xs">{match.id}</td>
                                        <td className="py-3 px-4 text-sm">
                                            {players.map(p => p.username).join(', ')}
                                        </td>
                                        <td className="py-3 px-4">{match.wager} C</td>
                                        <td className="py-3 px-4 text-right space-x-2">
                                            <Button 
                                                variant="secondary"
                                                onClick={() => handleRefund(match.id)}
                                                className="!text-sm"
                                                title="Refund Both Players"
                                            >
                                                 <RefreshCw className="h-4 w-4 mr-2"/> Refund
                                            </Button>
                                            {players.map(player => (
                                                 <Button 
                                                    key={player.id}
                                                    variant="primary"
                                                    onClick={() => handleSettle(match, player.id)}
                                                    className="!bg-green-600 hover:!bg-green-500 !text-sm"
                                                    title={`Settle for ${player.username}`}
                                                >
                                                    <Trophy className="h-4 w-4 mr-2"/> Settle for {player.username}
                                                </Button>
                                            ))}
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-10">
                         <ShieldAlert className="h-12 w-12 text-gray-500 mx-auto mb-4"/>
                         <p className="text-gray-400">There are no active disputes to review.</p>
                    </div>
                )}
            </Card>
        </div>
    );
}

export default AdminDisputesPage;