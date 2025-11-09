import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import { useAppContext } from '../hooks/useAppContext';
import type { Match, User } from '../types';
import { MatchStatus } from '../types';
import Button from '../components/ui/Button';
import { Pencil, ThumbsUp, ShieldCheck } from 'lucide-react';
import EditProfileModal from '../components/profile/EditProfileModal';
import { GAMES, PLATFORMS } from '../constants';
import GameSelectionModal from '../components/onboarding/GameSelectionModal';

function ProfilePage() {
    const { user, allUsers, matches, updateUser } = useAppContext();
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isGameSelectionModalOpen, setGameSelectionModalOpen] = useState(false);

    if (!user) return <div>Loading profile...</div>;

    const userMatchHistory = matches.filter(match => 
        [...match.teamA, ...match.teamB].includes(user.id) && [MatchStatus.COMPLETED, MatchStatus.DISPUTED, MatchStatus.REFUNDED].includes(match.status)
    );
    
    const userPrimaryGames = useMemo(() => GAMES.filter(game => user.primaryGames?.includes(game.id)), [user.primaryGames]);
    const userPlatforms = useMemo(() => PLATFORMS.filter(p => user.platforms?.includes(p.id)), [user.platforms]);

    const getMatchResult = (match: Match) => {
        if (match.status === MatchStatus.DISPUTED) return 'Disputed';
        if (match.status === MatchStatus.REFUNDED) return 'Refunded';
        
        if (match.status === MatchStatus.COMPLETED) {
            if (match.winnerTeam === null) return 'Draw';
            if (!match.winnerTeam) return 'N/A';

            const playerTeam = match.teamA.includes(user.id) ? 'A' : match.teamB.includes(user.id) ? 'B' : null;
            if (playerTeam) {
                return match.winnerTeam === playerTeam ? 'Win' : 'Loss';
            }
        }

        return 'N/A';
    };

    const handleProfileUpdate = (updatedUser: Partial<User>) => {
        updateUser(updatedUser);
        setEditModalOpen(false);
    };
    
    const handleGameSelectionSave = (selectedGameIds: string[]) => {
        updateUser({ primaryGames: selectedGameIds });
        setGameSelectionModalOpen(false);
    };

    const goodSportPercentage = user.totalMatchesRated > 0 
        ? Math.round((user.goodSportRating / user.totalMatchesRated) * 100) 
        : 100;

    return (
        <>
            <div className="space-y-8">
                <Card className="!p-0 overflow-hidden">
                    <div className="bg-gray-200 dark:bg-gray-700 h-32" style={{backgroundImage: `url(https://picsum.photos/seed/${user.id}/1200/300)`, backgroundSize: 'cover'}}></div>
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-20 sm:-mt-16">
                            <img src={user.avatarUrl} alt={user.username} className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800" />
                            <div className="ml-0 sm:ml-4 mt-4 sm:mt-0 w-full flex-grow flex flex-col sm:flex-row items-center sm:justify-between">
                                <div className="text-center sm:text-left">
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.username}</h1>
                                    <p className="text-gray-500 dark:text-gray-400">{user.linkedAccounts.discord}</p>
                                     <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                                        {userPlatforms.map(platform => {
                                            const PlatformIcon = platform.icon;
                                            return (
                                                <span key={platform.id} title={platform.name} className="bg-gray-600 dark:bg-gray-900 text-white text-xs font-semibold p-2 rounded-full flex items-center">
                                                    <PlatformIcon className="h-4 w-4"/>
                                                </span>
                                            )
                                        })}
                                        {userPrimaryGames.map(game => {
                                            const GameIcon = game.icon;
                                            return (
                                                <span key={game.id} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center">
                                                    {GameIcon && <GameIcon className="h-4 w-4 mr-1.5"/>}
                                                    {game.name}
                                                </span>
                                            )
                                        })}
                                    </div>
                                </div>
                                <Button variant="secondary" onClick={() => setEditModalOpen(true)} className="mt-4 sm:mt-0">
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit Profile
                                </Button>
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                             <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.rating}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">User Rating</p>
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
                        </div>
                    </div>
                </Card>
                
                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
                        <span className="flex items-center">
                            <ShieldCheck className="h-6 w-6 mr-3 text-brand-primary" />
                            Game Ratings (ELO)
                        </span>
                        <Button variant="secondary" onClick={() => setGameSelectionModalOpen(true)} className="!py-1 !px-2 !text-sm">
                           <Pencil className="h-4 w-4 mr-2" />
                           Edit Games
                        </Button>
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
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">Select your primary games by editing your profile to see your ELO ratings here.</p>
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
                                    <th className="py-2 px-2 sm:px-4">Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userMatchHistory.map(match => {
                                    const result = getMatchResult(match);
                                    const resultColor = result === 'Win' ? 'text-green-500 dark:text-green-400' : result === 'Loss' ? 'text-red-500 dark:text-red-400' : 'text-yellow-500 dark:text-yellow-400';
                                    const opponentIds = [...match.teamA, ...match.teamB].filter(pId => pId !== user.id);
                                    const opponents = opponentIds.map(id => allUsers.find(u => u.id === id)).filter(Boolean) as User[];
                                    
                                    return (
                                        <tr key={match.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="py-3 px-2 sm:px-4 flex items-center text-gray-900 dark:text-white font-medium">
                                                <img src={match.game.imageUrl} alt={match.game.name} className="w-8 h-8 rounded-md mr-3 object-cover flex-shrink-0" />
                                                {match.game.name}
                                            </td>
                                            <td className="py-3 px-2 sm:px-4">
                                                {opponents.length > 0 ? (
                                                    opponents.map((op, index) => (
                                                        <React.Fragment key={op.id}>
                                                            <Link to={`/users/${op.username}`} className="hover:underline text-brand-primary">
                                                                {op.username}
                                                            </Link>
                                                            {index < opponents.length - 1 && ', '}
                                                        </React.Fragment>
                                                    ))
                                                ) : 'N/A'}
                                            </td>
                                            <td className="py-3 px-2 sm:px-4 text-gray-600 dark:text-gray-300">{match.wager} C</td>
                                            <td className={`py-3 px-2 sm:px-4 font-semibold ${resultColor}`}>{result}</td>
                                            <td className="py-3 px-2 sm:px-4 text-gray-600 dark:text-gray-300">{match.teamSize}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            <EditProfileModal 
                isOpen={isEditModalOpen}
                onClose={() => setEditModalOpen(false)}
                user={user}
                onSave={handleProfileUpdate}
            />
            <GameSelectionModal
                isOpen={isGameSelectionModalOpen}
                onSave={handleGameSelectionSave}
                onClose={() => setGameSelectionModalOpen(false)}
                initialSelectedGames={user.primaryGames}
                isEditing={true}
            />
        </>
    );
}

export default ProfilePage;