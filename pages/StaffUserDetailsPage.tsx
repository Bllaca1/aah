import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import { useAppContext } from '../hooks/useAppContext';
import type { Match, User } from '../types';
import { MatchStatus, UserRole } from '../types';
import Button from '../components/ui/Button';
import { ArrowLeft, Ban, ShieldCheck, ThumbsUp, Wallet } from 'lucide-react';
import PresenceIndicator from '../components/ui/PresenceIndicator';
import { GAMES } from '../constants';
import BanUserModal from '../components/staff/BanUserModal';

function StaffUserDetailsPage() {
    const { userId } = useParams<{ userId: string }>();
    const { matches, allUsers, user: loggedInUser } = useAppContext();
    const navigate = useNavigate();
    const [isBanModalOpen, setBanModalOpen] = useState(false);

    const user = allUsers.find(u => u.id === userId);

    if (!user) return (
        <Card className="text-center py-10">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User not found</h1>
            <p className="text-gray-500 dark:text-gray-400">Could not find a user with this ID.</p>
             <Button variant="secondary" onClick={() => navigate(-1)} className="mt-4 inline-flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
            </Button>
        </Card>
    );

    const userMatchHistory = matches.filter(match => 
        [...match.teamA, ...match.teamB].includes(user.id) && [MatchStatus.COMPLETED, MatchStatus.DISPUTED, MatchStatus.REFUNDED].includes(match.status)
    );
    
    const userPrimaryGames = useMemo(() => GAMES.filter(game => user.primaryGames?.includes(game.id)), [user.primaryGames]);

    const getMatchResult = (match: Match, currentUser: User) => {
        if (match.status === MatchStatus.DISPUTED) return 'Disputed';
        if (match.status === MatchStatus.REFUNDED) return 'Refunded';
        
        if (match.status === MatchStatus.COMPLETED) {
            if (match.winnerTeam === null) return 'Draw';
            if (!match.winnerTeam) return 'N/A';
    
            const playerTeam = match.teamA.includes(currentUser.id) ? 'A' : match.teamB.includes(currentUser.id) ? 'B' : null;
            if (playerTeam) {
                return match.winnerTeam === playerTeam ? 'Win' : 'Loss';
            }
        }
        return 'N/A';
    };

    const goodSportPercentage = user.totalMatchesRated > 0 
        ? Math.round((user.goodSportRating / user.totalMatchesRated) * 100) 
        : 100;

    const accountStatusColors = {
        active: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
        suspended: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300',
        banned: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300',
    };

    return (
        <>
            <div className="space-y-8">
                <Button variant="secondary" onClick={() => navigate(-1)} className="inline-flex items-center">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Search
                </Button>
                <Card className="!p-0 overflow-hidden">
                    <div className="bg-gray-200 dark:bg-gray-700 h-32" style={{backgroundImage: `url(https://picsum.photos/seed/${user.id}/1200/300)`, backgroundSize: 'cover'}}></div>
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-20 sm:-mt-16">
                            <div className="relative flex-shrink-0">
                                <img src={user.avatarUrl} alt={user.username} className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800" />
                                <div className="absolute bottom-1 right-1">
                                    <PresenceIndicator status={user.status}/>
                                </div>
                            </div>
                            <div className="ml-0 sm:ml-4 mt-4 sm:mt-0 w-full flex-grow">
                                <div className="text-center sm:text-left">
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.username}</h1>
                                    <p className="text-gray-500 dark:text-gray-400">{user.email || 'No email provided'}</p>
                                    <div className="mt-2">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${accountStatusColors[user.accountStatus]}`}>
                                            {user.accountStatus.charAt(0).toUpperCase() + user.accountStatus.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                         <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                             <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2"><Wallet className="text-green-500"/>{user.credits.toFixed(2)}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Credits</p>
                            </div>
                             <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center">
                                    {goodSportPercentage}%
                                    <ThumbsUp className="h-5 w-5 ml-2 text-green-400" />
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Good Sport</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{userMatchHistory.length}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Matches Played</p>
                            </div>
                              <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.rating}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">User Rating</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {loggedInUser?.id !== user.id && (
                    <Card className="border-red-500/30">
                        <h2 className="text-xl font-bold text-red-500 dark:text-red-400 mb-4">Moderation</h2>
                        <Button variant="danger" onClick={() => setBanModalOpen(true)} disabled={user.role === UserRole.STAFF}>
                            <Ban className="h-4 w-4 mr-2" />
                            {user.role === UserRole.STAFF ? "Cannot Ban Staff" : "Moderate User"}
                        </Button>
                    </Card>
                )}

                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                        <ShieldCheck className="h-6 w-6 mr-3 text-brand-primary" />
                        Game Ratings (ELO)
                    </h2>
                    {userPrimaryGames.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {userPrimaryGames.map(game => {
                                const GameIcon = game.icon;
                                return (
                                    <div key={game.id} className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center space-x-4">
                                        {GameIcon && <GameIcon className="h-8 w-8 text-gray-600 dark:text-gray-400 flex-shrink-0" />}
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{game.name}</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.elo[game.id] || 1500}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">This player hasn't selected their primary games yet.</p>
                    )}
                </Card>

                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Match History</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                                    <th className="py-2 px-2 sm:px-4">Game</th>
                                    <th className="py-2 px-2 sm:px-4">Opponent(s)</th>
                                    <th className="py-2 px-2 sm:px-4">Wager</th>
                                    <th className="py-2 px-2 sm:px-4">Result</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userMatchHistory.map(match => {
                                    const result = getMatchResult(match, user);
                                    const resultColor = result === 'Win' ? 'text-green-500' : result === 'Loss' ? 'text-red-500' : 'text-yellow-500';
                                    const opponentIds = [...match.teamA, ...match.teamB].filter(pId => pId !== user.id);
                                    const opponents = opponentIds.map(id => allUsers.find(u => u.id === id)).filter(Boolean) as User[];
                                    
                                    return (
                                        <tr key={match.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="py-3 px-2 sm:px-4 text-gray-900 dark:text-white font-medium">{match.game.name}</td>
                                            <td className="py-3 px-2 sm:px-4">{opponents.map(op => op.username).join(', ')}</td>
                                            <td className="py-3 px-2 sm:px-4 text-gray-600 dark:text-gray-300">{match.wager} C</td>
                                            <td className={`py-3 px-2 sm:px-4 font-semibold ${resultColor}`}>{result}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            <BanUserModal 
                isOpen={isBanModalOpen}
                onClose={() => setBanModalOpen(false)}
                userToBan={user}
            />
        </>
    );
}

export default StaffUserDetailsPage;