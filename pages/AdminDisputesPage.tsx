import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { MatchStatus } from '../types';
import type { Match, User } from '../types';
import { ShieldAlert, RefreshCw, Trophy, Youtube, MessageSquare } from 'lucide-react';
import Modal from '../components/ui/Modal';

const EvidenceModal: React.FC<{ match: Match, onClose: () => void }> = ({ match, onClose }) => {
    const { allUsers } = useAppContext();
    const evidence = match.disputeDetails?.playerEvidence || {};
    const players = [...match.teamA, ...match.teamB].map(id => allUsers.find(u => u.id === id)).filter(Boolean) as User[];
    
    return (
        <Modal isOpen={true} onClose={onClose} title={`Dispute Evidence for Match #${match.id.slice(-6)}`}>
            <div className="space-y-4">
                {players.map(player => {
                    const playerEvidence = evidence[player.id];
                    return (
                        <div key={player.id} className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center space-x-3 mb-2">
                                <img src={player.avatarUrl} alt={player.username} className="w-8 h-8 rounded-full" />
                                <h4 className="font-bold text-gray-900 dark:text-white">{player.username}</h4>
                            </div>
                            {playerEvidence ? (
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center">
                                        <Youtube className="h-4 w-4 mr-2 text-red-500 flex-shrink-0"/>
                                        <a href={playerEvidence.youtubeLink} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline truncate">{playerEvidence.youtubeLink}</a>
                                    </div>
                                     <div className="flex items-start">
                                        <MessageSquare className="h-4 w-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0"/>
                                        <p className="text-gray-600 dark:text-gray-300">{playerEvidence.message || 'No message provided.'}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No evidence submitted.</p>
                            )}
                        </div>
                    );
                })}
            </div>
        </Modal>
    );
};


function AdminDisputesPage() {
    const { matches, allUsers, updateMatch, updateUserById, reportMatchResult } = useAppContext();
    const [viewingMatch, setViewingMatch] = useState<Match | null>(null);

    const disputedMatches = matches.filter(m => [MatchStatus.DISPUTED, MatchStatus.AWAITING_ADMIN_REVIEW, MatchStatus.AWAITING_OPPONENT_EVIDENCE].includes(m.status));

    const handleSettle = (match: Match, winningTeam: 'A' | 'B') => {
        const loserTeamIds = winningTeam === 'A' ? match.teamB : match.teamA;
        
        loserTeamIds.forEach(loserId => {
            const loserData = allUsers.find(u => u.id === loserId);
            if(loserData) {
                const newRating = Math.max(0, loserData.rating - 25);
                console.log(`Penalizing ${loserData.username}. Old rating: ${loserData.rating}, New rating: ${newRating}`);
                updateUserById(loserId, { rating: newRating });
            }
        });
        
        console.log(`Admin settling match ${match.id}, winner team: ${winningTeam}`);
        reportMatchResult(match.id, winningTeam);
    };


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
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
                                <tr className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                                    <th className="py-2 px-2 sm:px-4">Match ID</th>
                                    <th className="py-2 px-2 sm:px-4">Players</th>
                                    <th className="py-2 px-2 sm:px-4">Status</th>
                                    <th className="py-2 px-2 sm:px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {disputedMatches.map((match: Match) => {
                                    const teamAPlayers = match.teamA.map(id => allUsers.find(u => u.id === id)?.username).filter(Boolean);
                                    const teamBPlayers = match.teamB.map(id => allUsers.find(u => u.id === id)?.username).filter(Boolean);
                                    
                                    return (
                                    <tr key={match.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="py-3 px-2 sm:px-4 font-mono text-xs text-gray-800 dark:text-gray-200">{match.id.slice(-6)}</td>
                                        <td className="py-3 px-2 sm:px-4 text-sm text-gray-800 dark:text-gray-200">
                                            <span className="font-semibold text-blue-500">{teamAPlayers.join(', ')}</span> vs <span className="font-semibold text-red-500">{teamBPlayers.join(', ')}</span>
                                        </td>
                                         <td className="py-3 px-2 sm:px-4 text-sm text-yellow-600 dark:text-yellow-400 font-medium">{match.status}</td>
                                        <td className="py-3 px-2 sm:px-4">
                                            <div className="flex flex-wrap justify-end gap-2">
                                                {(match.status === MatchStatus.AWAITING_ADMIN_REVIEW || match.status === MatchStatus.AWAITING_OPPONENT_EVIDENCE) && (
                                                    <Button variant="secondary" onClick={() => setViewingMatch(match)} className="!text-sm">View Evidence</Button>
                                                )}
                                                <Button variant="secondary" onClick={() => updateMatch(match.id, {status: MatchStatus.REFUNDED})} className="!text-sm" title="Refund Both Parties">
                                                     <RefreshCw className="h-4 w-4 md:mr-2"/> <span className="hidden md:inline">Refund</span>
                                                </Button>
                                                <Button variant="primary" onClick={() => handleSettle(match, 'A')} className="!bg-blue-600 hover:!bg-blue-500 !text-sm" title={`Settle for Team A`}>
                                                    <Trophy className="h-4 w-4 md:mr-2"/> <span className="hidden md:inline">Team A Wins</span>
                                                </Button>
                                                <Button variant="primary" onClick={() => handleSettle(match, 'B')} className="!bg-red-600 hover:!bg-red-500 !text-sm" title={`Settle for Team B`}>
                                                    <Trophy className="h-4 w-4 md:mr-2"/> <span className="hidden md:inline">Team B Wins</span>
                                                </Button>
                                            </div>
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
            {viewingMatch && <EvidenceModal match={viewingMatch} onClose={() => setViewingMatch(null)} />}
        </div>
    );
}

export default AdminDisputesPage;