


import React from 'react';
import { Link } from 'react-router-dom';
import type { Match, User, Team } from '../../types';
import Button from '../ui/Button';
import { Coins, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { MatchTeamSize, MatchStatus } from '../../types';
import PresenceIndicator from '../ui/PresenceIndicator';

// Simple time ago function
const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "just now";
}

interface MatchCardProps {
    match: Match;
    onViewClick?: (match: Match) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onViewClick }) => {
    const { user: currentUser, allUsers, teams } = useAppContext();

    const statusColors: { [key: string]: string } = {
        'Open': 'border-green-500',
        'In Progress': 'border-blue-500',
        'Completed': 'border-gray-500',
        'Disputed': 'border-red-500',
        'Refunded': 'border-yellow-500'
    };

    const GameIcon = match.game.icon;
    const creator = allUsers.find(u => u.id === match.teamA[0]);

    const renderPlayer = (player: User | null) => {
        const content = (
            <div className="flex flex-col items-center w-24">
                <img 
                    src={player ? player.avatarUrl : 'https://i.pravatar.cc/150?u=empty'} 
                    alt={player ? player.username : 'Waiting'} 
                    className={`w-12 h-12 rounded-full border-2 ${player ? 'border-gray-600' : 'border-dashed border-gray-500 opacity-50'}`}
                />
                <p className="mt-2 text-xs text-center text-white truncate w-full font-semibold">{player ? player.username : 'Waiting...'}</p>
            </div>
        );

        if (player) {
            return (
                <Link to={player.id === currentUser?.id ? '/profile' : `/users/${player.username}`} className="transition-transform duration-200 hover:scale-110">
                    {content}
                </Link>
            );
        }
        return content;
    };
    
    const TeamDisplay: React.FC<{ team: Team | undefined, players: string[], teamLetter: 'A' | 'B' }> = ({ team, players, teamLetter }) => (
        <div className="flex flex-col items-center">
            {team ? (
                <>
                    <img src={team.avatarUrl} alt={team.name} className="w-12 h-12 rounded-full border-2 border-gray-600 bg-gray-900" />
                    <p className="mt-2 text-sm text-center text-white truncate w-full font-semibold">{team.name} <span className="text-gray-400">[{team.tag}]</span></p>
                </>
            ) : (
                 <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-500 opacity-50 bg-gray-900" />
            )}
            <p className="mt-1 text-xs text-gray-400">{team ? `${players.length}/5 players` : `Team ${teamLetter}`}</p>
        </div>
    );

    const renderMatchup = () => {
        if (match.teamSize === MatchTeamSize.SOLO) {
            const player1 = allUsers.find(u => u.id === match.teamA[0]);
            const player2 = allUsers.find(u => u.id === match.teamB[0]);
            return (
                <div className="flex items-center justify-around w-full">
                    {renderPlayer(player1 || null)}
                    <span className="text-gray-500 font-bold text-lg">VS</span>
                    {renderPlayer(player2 || null)}
                </div>
            );
        } else { // Team match
            const teamA = teams.find(t => t.id === match.teamAId);
            const teamB = teams.find(t => t.id === match.teamBId);
            return (
                 <div className="flex items-center justify-around w-full">
                    <TeamDisplay team={teamA} players={match.teamA} teamLetter="A" />
                    <span className="text-gray-500 font-bold text-lg">VS</span>
                    <TeamDisplay team={teamB} players={match.teamB} teamLetter="B" />
                </div>
            );
        }
    };


    return (
        <div className={`bg-gray-800 rounded-lg overflow-hidden shadow-lg border-t-4 ${statusColors[match.status] || 'border-gray-700'} transition-transform duration-300 hover:scale-105 flex flex-col`}>
            <div className="relative">
                <img src={match.game.imageUrl} alt={match.game.name} className="w-full h-32 object-cover"/>
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs font-bold py-1 px-2 rounded flex items-center">
                    {GameIcon && <GameIcon className="h-3 w-3 mr-1.5" />}
                    {match.game.name}
                </div>
                 {match.status === MatchStatus.IN_PROGRESS && (
                     <div className="absolute top-2 left-2 flex items-center text-blue-300 bg-gray-900/70 px-2 py-1 rounded-full text-xs font-semibold">
                         <span className="relative flex h-2 w-2 mr-2">
                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                             <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                         </span>
                         IN PROGRESS
                     </div>
                 )}
                 {match.status === MatchStatus.DISPUTED && (
                     <div className="absolute top-2 left-2 flex items-center text-red-400 bg-red-900 bg-opacity-50 px-2 py-1 rounded-full text-xs">
                         <AlertTriangle className="h-4 w-4 mr-1 animate-pulse" />
                         DISPUTED
                     </div>
                 )}
            </div>
            <div className="p-4 space-y-4 flex-grow flex flex-col">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Coins className="h-6 w-6 text-yellow-400" />
                        <div>
                            <p className="text-xs text-gray-400">Wager</p>
                            <p className="text-lg font-bold text-white">{match.wager} C</p>
                        </div>
                    </div>
                     <div className="text-right">
                        <p className="text-xs text-gray-400">Prize Pool</p>
                        <p className="text-lg font-bold text-green-400">{match.prizePool} C</p>
                    </div>
                </div>
                
                <div className="flex-grow flex flex-col justify-center items-center my-2">
                    {renderMatchup()}
                    <div className="text-xs text-gray-400 mt-3 text-center">
                        <span>{match.teamSize} &bull; {match.region} &bull; ELO: {match.elo}</span>
                    </div>
                </div>
                
                {match.status === MatchStatus.OPEN && creator && (
                    <div className="text-center text-xs text-gray-500 flex items-center justify-center space-x-2">
                        <span>created {timeAgo(match.createdAt)}</span>
                        <PresenceIndicator status={creator.status} size="sm" />
                    </div>
                )}

                <div className="mt-auto pt-2">
                    {match.status === 'Open' ? (
                         <Button className="w-full" onClick={() => onViewClick && onViewClick(match)}>View &amp; Join</Button>
                    ) : (
                        <Button className="w-full" variant="secondary" onClick={() => onViewClick && onViewClick(match)}>
                            {match.status === 'In Progress' || match.status === 'Disputed' ? 'View Match' : 'View Result'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MatchCard;