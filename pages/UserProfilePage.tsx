import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import { useAppContext } from '../hooks/useAppContext';
import type { Match, User } from '../types';
import { MatchStatus } from '../types';
import Button from '../components/ui/Button';
import { UserPlus, Check, MessageSquareWarning, Trash2, ThumbsUp } from 'lucide-react';
import PresenceIndicator from '../components/ui/PresenceIndicator';

function UserProfilePage() {
    const { username } = useParams<{ username: string }>();
    const { matches, allUsers, user: loggedInUser, sendFriendRequest, removeFriend } = useAppContext();
    const navigate = useNavigate();

    const user = allUsers.find(u => u.username === username);

    if (!user) return (
        <Card className="text-center py-10">
            <h1 className="text-2xl font-bold text-white">User not found</h1>
            <p className="text-gray-400">Could not find a user with the name "{username}".</p>
        </Card>
    );

    const userMatchHistory = matches.filter(match => 
        [...match.teamA, ...match.teamB].includes(user.id) && [MatchStatus.COMPLETED, MatchStatus.DISPUTED, MatchStatus.REFUNDED].includes(match.status)
    );
    
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

    const renderFriendButton = () => {
        if (!loggedInUser || user.id === loggedInUser.id) return null;

        const isFriend = loggedInUser.friends.includes(user.id);
        const hasSentRequest = loggedInUser.friendRequests.sent.includes(user.id);
        const hasReceivedRequest = loggedInUser.friendRequests.received.includes(user.id);

        if (isFriend) {
            return (
                <div className="flex items-center space-x-2">
                     <Button variant="secondary" disabled className="!cursor-default">
                        <Check className="h-4 w-4 mr-2" />
                        Friends
                    </Button>
                     <Button variant="danger" onClick={() => removeFriend(user.id)} title="Unfriend">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Unfriend</span>
                    </Button>
                </div>
            );
        }
        if (hasSentRequest) {
            return <Button variant="secondary" disabled>Request Sent</Button>;
        }
        if (hasReceivedRequest) {
            return (
                <Button onClick={() => navigate('/friends?tab=incoming')}>
                    <MessageSquareWarning className="h-4 w-4 mr-2" />
                    Respond to Request
                </Button>
            );
        }
        return (
            <Button onClick={() => sendFriendRequest(user.id)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Friend
            </Button>
        );
    };

    const goodSportPercentage = user.totalMatchesRated > 0 
        ? Math.round((user.goodSportRating / user.totalMatchesRated) * 100) 
        : 100;

    return (
        <div className="space-y-8">
            <Card className="!p-0 overflow-hidden">
                <div className="bg-gray-700 h-32" style={{backgroundImage: `url(https://picsum.photos/seed/${user.id}/1200/300)`, backgroundSize: 'cover'}}></div>
                <div className="p-6">
                    <div className="flex items-end -mt-16">
                        <div className="relative">
                            <img src={user.avatarUrl} alt={user.username} className="w-24 h-24 rounded-full border-4 border-gray-800" />
                            <div className="absolute bottom-1 right-1">
                                <PresenceIndicator status={user.status}/>
                            </div>
                        </div>
                        <div className="ml-4 flex-grow flex justify-between items-end">
                             <div>
                                <h1 className="text-2xl font-bold text-white">{user.username}</h1>
                                <p className="text-gray-400">{user.linkedAccounts.discord}</p>
                            </div>
                            {renderFriendButton()}
                        </div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-white">{user.elo}</p>
                            <p className="text-sm text-gray-400">ELO</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{user.rating}</p>
                            <p className="text-sm text-gray-400">User Rating</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{userMatchHistory.length}</p>
                            <p className="text-sm text-gray-400">Matches Played</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white flex items-center justify-center">
                                {goodSportPercentage}%
                                <ThumbsUp className="h-5 w-5 ml-2 text-green-400" />
                            </p>
                            <p className="text-sm text-gray-400">Good Sport</p>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-white mb-4">Match History</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-700 text-sm text-gray-400">
                                <th className="py-2 px-4">Game</th>
                                <th className="py-2 px-4">Opponent(s)</th>
                                <th className="py-2 px-4">Wager</th>
                                <th className="py-2 px-4">Result</th>
                                <th className="py-2 px-4">Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userMatchHistory.map(match => {
                                const result = getMatchResult(match, user);
                                const resultColor = result === 'Win' ? 'text-green-400' : result === 'Loss' ? 'text-red-400' : 'text-yellow-400';
                                const opponentIds = [...match.teamA, ...match.teamB].filter(pId => pId !== user.id);
                                const opponents = opponentIds.map(id => allUsers.find(u => u.id === id)).filter(Boolean) as User[];
                                
                                return (
                                    <tr key={match.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                        <td className="py-3 px-4 flex items-center">
                                            <img src={match.game.imageUrl} alt={match.game.name} className="w-8 h-8 rounded-md mr-3 object-cover flex-shrink-0" />
                                            {match.game.name}
                                        </td>
                                        <td className="py-3 px-4">
                                            {opponents.length > 0 ? (
                                                opponents.map((op, index) => (
                                                    <React.Fragment key={op.id}>
                                                        <Link to={op.id === loggedInUser?.id ? '/profile' : `/users/${op.username}`} className="hover:underline text-brand-primary">
                                                            {op.username}
                                                        </Link>
                                                        {index < opponents.length - 1 && ', '}
                                                    </React.Fragment>
                                                ))
                                            ) : 'N/A'}
                                        </td>
                                        <td className="py-3 px-4">{match.wager} C</td>
                                        <td className={`py-3 px-4 font-semibold ${resultColor}`}>{result}</td>
                                        <td className="py-3 px-4">{match.teamSize}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

export default UserProfilePage;