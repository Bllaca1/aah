import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { MatchStatus } from '../types';
import type { Match } from '../types';
import { ShieldAlert, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';


function StaffDisputesPage() {
    const { matches, allUsers } = useAppContext();

    const disputedMatches = matches.filter(m => [MatchStatus.DISPUTED, MatchStatus.AWAITING_ADMIN_REVIEW, MatchStatus.AWAITING_OPPONENT_EVIDENCE].includes(m.status));

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                    <ShieldAlert className="h-8 w-8 mr-3 text-red-400" />
                    All Active Disputes
                </h1>
                <p className="text-gray-400 mt-1">An overview of all matches currently in a disputed state.</p>
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
                                        <td className="py-3 px-2 sm:px-4 text-right">
                                             <Link to={`/staff/disputes/${match.id}`}>
                                                <Button variant="secondary" className="!text-sm">
                                                    <Eye className="h-4 w-4 md:mr-2" />
                                                    <span className="hidden md:inline">Review</span>
                                                </Button>
                                            </Link>
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

export default StaffDisputesPage;