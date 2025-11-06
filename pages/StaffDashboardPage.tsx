import React from 'react';
import Card from '../components/ui/Card';
import { Shield, Eye } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';
import { MatchStatus } from '../types';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

function StaffDashboardPage() {
    const { matches, allUsers } = useAppContext();

    const matchesToReview = matches.filter(
        m => m.status === MatchStatus.AWAITING_ADMIN_REVIEW
    );

    const getPlayerNames = (playerIds: string[]): string => {
        return playerIds
            .map(id => allUsers.find(u => u.id === id)?.username)
            .filter(Boolean)
            .join(', ');
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                    <Shield className="h-8 w-8 mr-3 text-brand-primary" />
                    Staff Dashboard
                </h1>
                <p className="text-gray-400 mt-1">Welcome to the staff area. Here are the disputes that need your attention.</p>
            </div>
            <Card>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Disputes Awaiting Your Review</h2>
                {matchesToReview.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                                    <th className="py-2 px-2 sm:px-4">Dispute ID</th>
                                    <th className="py-2 px-2 sm:px-4">Players Involved</th>
                                    <th className="py-2 px-2 sm:px-4">Wager</th>
                                    <th className="py-2 px-2 sm:px-4">Date Submitted</th>
                                    <th className="py-2 px-2 sm:px-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {matchesToReview.map(match => (
                                    <tr key={match.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="py-3 px-2 sm:px-4 font-mono text-xs">{match.id.slice(-6)}</td>
                                        <td className="py-3 px-2 sm:px-4 text-sm">
                                            {getPlayerNames(match.teamA)} vs {getPlayerNames(match.teamB)}
                                        </td>
                                        <td className="py-3 px-2 sm:px-4">{match.wager} C</td>
                                        <td className="py-3 px-2 sm:px-4 text-sm">{new Date(match.createdAt).toLocaleDateString()}</td>
                                        <td className="py-3 px-2 sm:px-4 text-right">
                                            <Link to={`/staff/disputes/${match.id}`}>
                                                <Button variant="secondary" className="!text-sm">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Review Dispute
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center py-8 text-gray-500 dark:text-gray-400">No disputes are currently awaiting review. Great job!</p>
                )}
            </Card>
        </div>
    );
}

export default StaffDashboardPage;