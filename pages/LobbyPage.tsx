import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowLeft, CheckCircle, Copy, Loader, Shield, Swords, UserPlus, Users, Wallet } from 'lucide-react';
import { MatchStatus, MatchTeamSize } from '../types';
import type { User, Team } from '../types';
import LobbyPlayerSlot from '../components/lobby/LobbyPlayerSlot';

const InviteControl: React.FC<{ matchId: string }> = ({ matchId }) => {
    const { allUsers, inviteToLobby } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [inviteSent, setInviteSent] = useState('');

    const results = useMemo(() => {
        if (!searchTerm) return [];
        return allUsers.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 3);
    }, [searchTerm, allUsers]);

    const handleInvite = (userId: string) => {
        inviteToLobby(matchId, userId);
        setInviteSent(userId);
        setSearchTerm('');
        setTimeout(() => setInviteSent(''), 2000);
    };

    return (
        <div className="relative">
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Invite player by username..."
                className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-4"
            />
            {searchTerm && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                    {results.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <span>{user.username}</span>
                            <Button 
                                className="!py-1 !px-2 !text-xs" 
                                onClick={() => handleInvite(user.id)}
                                disabled={inviteSent === user.id}
                            >
                                {inviteSent === user.id ? 'Sent!' : 'Invite'}
                            </Button>
                        </div>
                    ))}
                    {results.length === 0 && <p className="p-2 text-sm text-gray-500">No users found.</p>}
                </div>
            )}
        </div>
    );
};


function LobbyPage() {
    const { matchId } = useParams<{ matchId: string }>();
    const { user, allUsers, matches, teams, readyUp, startPrivateMatch } = useAppContext();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);

    const match = matches.find(m => m.id === matchId);

    if (!match || !user) {
        return <Card><p>Lobby not found...</p></Card>;
    }

    const isCreator = match.teamA[0] === user.id;
    const isPlayerInMatch = [...match.teamA, ...match.teamB].includes(user.id);
    const isReady = match.readyPlayers.includes(user.id);

    const teamAPlayers = match.teamA.map(id => allUsers.find(u => u.id === id)).filter(Boolean) as User[];
    const teamBPlayers = match.teamB.map(id => allUsers.find(u => u.id === id)).filter(Boolean) as User[];
    const teamAData = teams.find(t => t.id === match.teamAId);

    const teamSizeMap: Record<MatchTeamSize, number> = {
        [MatchTeamSize.SOLO]: 1,
        [MatchTeamSize.DUO]: 2,
        [MatchTeamSize.TRIO]: 3,
        [MatchTeamSize.SQUAD]: 4,
        [MatchTeamSize.TEAM]: 5,
    };
    const maxTeamSize = teamSizeMap[match.teamSize];
    const isLobbyFull = teamAPlayers.length + teamBPlayers.length === maxTeamSize * 2;
    const areAllReady = isLobbyFull && (match.readyPlayers.length === maxTeamSize * 2);

    const handleCopyCode = () => {
        if (match.inviteCode) {
            navigator.clipboard.writeText(match.inviteCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="space-y-6">
            <Button variant="secondary" onClick={() => navigate('/matches')} className="inline-flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Lobby List
            </Button>
            
            <Card className="!p-0 overflow-hidden">
                <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Swords/> {match.game.name} Private Lobby
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Get your team ready for the duel.</p>
                    </div>
                    <div className="flex items-center gap-2">
                         <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg pl-3">
                            <span className="font-mono text-lg text-gray-800 dark:text-gray-200">{match.inviteCode}</span>
                            <Button className="!rounded-l-none" onClick={handleCopyCode}>
                                <Copy className="h-4 w-4 mr-2" /> {copied ? 'Copied!' : 'Copy'}
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div><p className="font-semibold text-gray-500 dark:text-gray-400">Wager</p><p className="text-2xl font-bold flex items-center justify-center gap-2"><Wallet/>{match.wager} C</p></div>
                    <div><p className="font-semibold text-gray-500 dark:text-gray-400">Mode</p><p className="text-2xl font-bold flex items-center justify-center gap-2"><Users/>{match.teamSize}</p></div>
                    <div><p className="font-semibold text-gray-500 dark:text-gray-400">Region</p><p className="text-2xl font-bold">{match.region}</p></div>
                </div>
            </Card>

            <div className="flex flex-col md:flex-row items-start gap-8">
                {/* Team A */}
                <Card className="flex-1 w-full">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Shield className="text-blue-400"/> {teamAData?.name || "Team A"}</h2>
                    <div className="space-y-2">
                        {Array.from({ length: maxTeamSize }).map((_, i) => (
                            <LobbyPlayerSlot key={`a-${i}`} user={teamAPlayers[i]} isReady={teamAPlayers[i] ? match.readyPlayers.includes(teamAPlayers[i].id) : false} />
                        ))}
                    </div>
                </Card>

                <p className="text-5xl font-black text-gray-400 dark:text-gray-600 self-center">VS</p>

                {/* Team B */}
                <Card className="flex-1 w-full">
                     <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Shield className="text-red-400"/>Team B</h2>
                     <div className="space-y-2">
                        {Array.from({ length: maxTeamSize }).map((_, i) => (
                            <LobbyPlayerSlot key={`b-${i}`} user={teamBPlayers[i]} isReady={teamBPlayers[i] ? match.readyPlayers.includes(teamBPlayers[i].id) : false} />
                        ))}
                    </div>
                </Card>
            </div>
            
            <Card>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1 w-full">
                        {isCreator && !isLobbyFull && <InviteControl matchId={match.id} />}
                        {!isCreator && !isLobbyFull && <p className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">Waiting for the lobby leader to invite more players...</p>}
                        {isLobbyFull && <p className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">Lobby is full! Get ready to start.</p>}
                    </div>
                    
                    <div className="flex items-center gap-3">
                         {isPlayerInMatch && !isReady && isLobbyFull && (
                            <Button onClick={() => readyUp(match.id)} className="!bg-green-600 hover:!bg-green-500">
                                <CheckCircle className="h-5 w-5 mr-2"/> Ready Up
                            </Button>
                        )}
                        {isCreator && (
                            <Button onClick={() => startPrivateMatch(match.id)} disabled={!areAllReady}>
                                {areAllReady ? 'Start Match' : <><Loader className="h-5 w-5 mr-2 animate-spin"/>Waiting for players...</>}
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

        </div>
    );
}

export default LobbyPage;
