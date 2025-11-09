import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowLeft, Award, CheckCircle, Wallet, Flag, ShieldAlert, XCircle, UserPlus, ThumbsUp, Youtube, MessageSquare, Clock, AlertTriangle } from 'lucide-react';
import { MatchStatus, MatchTeamSize } from '../types';
import type { User, Team, Match } from '../types';
import Modal from '../components/ui/Modal';
import MatchChat from '../components/chat/MatchChat';
import CountdownTimer from '../components/disputes/CountdownTimer';
import { PLATFORMS } from '../constants';


// --- Dispute Center Component ---
const DisputeCenter: React.FC<{ match: Match }> = ({ match }) => {
    const { user, submitDisputeEvidence } = useAppContext();
    const [youtubeLink, setYoutubeLink] = useState('');
    const [message, setMessage] = useState('');

    if (!user || !match.disputeDetails) return null;

    const userTeamIds = match.teamA.includes(user.id) ? match.teamA : match.teamB;
    const opponentTeamIds = match.teamA.includes(user.id) ? match.teamB : match.teamA;
    
    const userHasSubmitted = userTeamIds.some(id => match.disputeDetails?.playerEvidence[id]);
    const opponentHasSubmitted = opponentTeamIds.some(id => match.disputeDetails?.playerEvidence[id]);
    
    const deadlinePassed = new Date(match.disputeDetails.deadline) < new Date();
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitDisputeEvidence(match.id, { youtubeLink, message });
    };

    const StatusCard: React.FC<{ title: string; submitted: boolean }> = ({ title, submitted }) => (
        <div className={`p-4 rounded-lg flex-1 ${submitted ? 'bg-green-100 dark:bg-green-900/50' : 'bg-gray-100 dark:bg-gray-700/50'}`}>
            <h4 className="font-bold text-gray-800 dark:text-white">{title}</h4>
            <div className="flex items-center mt-2">
                {submitted ? <CheckCircle className="h-5 w-5 mr-2 text-green-500" /> : <Clock className="h-5 w-5 mr-2 text-gray-500 animate-pulse" />}
                <p className={`text-sm ${submitted ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'}`}>{submitted ? 'Evidence Submitted' : 'Awaiting Evidence'}</p>
            </div>
        </div>
    );

    return (
        <Card>
            <div className="text-center">
                <ShieldAlert className="h-12 w-12 mx-auto text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dispute Center</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    {match.status === MatchStatus.AWAITING_OPPONENT_EVIDENCE ? 
                    "Your evidence has been submitted. Waiting for the opponent." 
                    : "Submit your evidence before the deadline to resolve this match."}
                </p>
            </div>
            <div className="my-6 border-y border-gray-200 dark:border-gray-700 py-4">
                <CountdownTimer deadline={match.disputeDetails.deadline} />
            </div>
            <div className="flex flex-col md:flex-row gap-4 my-6">
                <StatusCard title="Your Evidence" submitted={userHasSubmitted} />
                <StatusCard title="Opponent's Evidence" submitted={opponentHasSubmitted} />
            </div>

            {(() => {
                if (match.status === MatchStatus.AWAITING_ADMIN_REVIEW) {
                     return (
                         <div className="bg-blue-100 dark:bg-blue-900/50 border border-blue-400 dark:border-blue-500 text-blue-800 dark:text-blue-300 text-sm rounded-lg p-4 text-center">
                            All evidence has been submitted. An admin will review the case shortly.
                        </div>
                    );
                }
                if (deadlinePassed) {
                    return null; // The timer component will display the "deadline passed" message.
                }
                if (userHasSubmitted) {
                    return (
                        <div className="text-center p-4 rounded-lg bg-green-100 dark:bg-green-900/50">
                            <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                            <h4 className="font-bold text-green-800 dark:text-green-200">Your evidence has been submitted successfully.</h4>
                        </div>
                    );
                }
                return (
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Submit Your Evidence</h3>
                        <div>
                            <label htmlFor="youtubeLink" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center"><Youtube className="h-4 w-4 mr-2"/>Unlisted YouTube Link</label>
                            <input type="url" id="youtubeLink" value={youtubeLink} onChange={e => setYoutubeLink(e.target.value)} required placeholder="https://www.youtube.com/watch?v=..." className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary w-full"/>
                        </div>
                         <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center"><MessageSquare className="h-4 w-4 mr-2"/>Message/Context</label>
                            <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="Briefly explain what happened..." className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary w-full"></textarea>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit">Submit Evidence</Button>
                        </div>
                    </form>
                );
            })()}
        </Card>
    );
};


// --- Team View ---
const TeamPlayerCard: React.FC<{ user: User }> = ({ user }) => {
    // Fix: Explicitly typed the `reduce` function's accumulator and current value to resolve a TypeScript error with arithmetic operations.
    const overallElo = Object.values(user.elo).length > 0 ? Math.round(Object.values(user.elo).reduce((a: number, b: number) => a + b, 0) / Object.values(user.elo).length) : 1500;
    return (
    <Link to={`/users/${user.username}`} className="flex items-center space-x-3 p-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg w-full max-w-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
        <img src={user.avatarUrl} alt={user.username} className="w-10 h-10 rounded-full" />
        <div>
            <p className="font-semibold text-gray-900 dark:text-white truncate">{user.username}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">ELO: {overallElo}</p>
        </div>
    </Link>
);
};

const EmptyTeamPlayerCard: React.FC = () => (
    <div className="flex items-center space-x-3 p-2 bg-gray-100 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg w-full max-w-xs">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
        <div>
            <p className="font-semibold text-gray-500">Open Slot</p>
        </div>
    </div>
);

const TeamDisplay: React.FC<{ 
    players: User[],
    teamData?: Team,
    teamName: 'A' | 'B', 
    maxTeamSize: number,
    matchId: string,
    isPlayerInMatch: boolean,
    status: MatchStatus,
    onJoin: (matchId: string, team: 'A' | 'B') => void,
    isInteractionLocked: boolean,
}> = ({ players, teamData, teamName, maxTeamSize, matchId, isPlayerInMatch, status, onJoin, isInteractionLocked }) => {
    const hasOpenSlot = players.length < maxTeamSize;
    
    return (
        <div className="flex-1 flex flex-col items-center p-4 bg-gray-200 dark:bg-gray-900 rounded-lg w-full">
            {teamData ? (
                <div className="text-center mb-4">
                    <img src={teamData.avatarUrl} alt={teamData.name} className="w-16 h-16 rounded-full mx-auto border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800" />
                    <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{teamData.name} <span className="text-gray-500 dark:text-gray-400">[{teamData.tag}]</span></h2>
                </div>
            ) : (
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">Team {teamName} <span className="text-gray-500 dark:text-gray-400">({players.length}/{maxTeamSize})</span></h2>
            )}
            <div className="space-y-3 w-full">
                {players.map(player => <TeamPlayerCard key={player.id} user={player} />)}
                {Array.from({ length: maxTeamSize - players.length }).map((_, i) => <EmptyTeamPlayerCard key={`empty-Team ${teamName}-${i}`} />)}
            </div>
            {!isPlayerInMatch && hasOpenSlot && status === MatchStatus.OPEN && (
                <Button 
                    className="mt-6 w-full" 
                    onClick={() => onJoin(matchId, teamName)}
                    disabled={isInteractionLocked}
                    title={isInteractionLocked ? "Complete your active match or dispute first." : `Join Team ${teamName}`}
                >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Join Team {teamName}
                </Button>
            )}
        </div>
    );
};


// --- 1v1 View ---
const PlayerCard: React.FC<{ user: User }> = ({ user }) => {
    const { user: currentUser } = useAppContext();
    // Fix: Explicitly typed the `reduce` function's accumulator and current value to resolve a TypeScript error with arithmetic operations.
    const overallElo = Object.values(user.elo).length > 0 ? Math.round(Object.values(user.elo).reduce((a: number, b: number) => a + b, 0) / Object.values(user.elo).length) : 1500;
    return (
        <Link to={user.id === currentUser?.id ? '/profile' : `/users/${user.username}`} className="transition-transform duration-200 hover:scale-105 w-48 text-center">
             <img src={user.avatarUrl} alt={user.username} className="w-32 h-32 rounded-full border-4 border-gray-300 dark:border-gray-700 mx-auto" />
            <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white truncate w-full">{user.username}</h3>
            <p className="text-md text-gray-500 dark:text-gray-400">ELO: {overallElo}</p>
        </Link>
    );
};

const EmptyPlayerCard: React.FC = () => (
    <div className="w-48 text-center">
        <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-800 border-4 border-dashed border-gray-300 dark:border-gray-700 mx-auto flex items-center justify-center">
            <p className="text-gray-500">Waiting...</p>
        </div>
         <h3 className="mt-4 text-xl font-bold text-gray-600 dark:text-gray-600">Open Slot</h3>
         <p className="text-md text-gray-500 dark:text-gray-500">Find a match in the lobby</p>
    </div>
);

function MatchDetailsPage() {
    const { matchId } = useParams<{ matchId: string }>();
    const { user, allUsers, matches, teams, joinTeam, reportMatchResult, disputeMatch, rateOpponents, isInteractionLocked } = useAppContext();
    const navigate = useNavigate();

    const [confirmationAction, setConfirmationAction] = useState<{
        type: 'win' | 'loss' | 'dispute';
        title: string;
        message: React.ReactNode;
        confirmText: string;
        confirmVariant: 'primary' | 'secondary' | 'danger';
        onConfirm: () => void;
    } | null>(null);

    const match = matches.find(m => m.id === matchId);

    if (!user || !match) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">Match not found or still loading...</p>
                <Button variant="secondary" onClick={() => navigate('/matches')} className="mt-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Lobby
                </Button>
            </div>
        );
    }
    
    const teamSizeMap: Record<MatchTeamSize, number> = {
        [MatchTeamSize.SOLO]: 1,
        [MatchTeamSize.DUO]: 2,
        [MatchTeamSize.TRIO]: 3,
        [MatchTeamSize.SQUAD]: 4,
        [MatchTeamSize.TEAM]: 5,
    };
    const maxTeamSize = teamSizeMap[match.teamSize];
    
    const isPlayerInMatch = [...match.teamA, ...match.teamB].includes(user.id);
    const userTeam = match.teamA.includes(user.id) ? 'A' : match.teamB.includes(user.id) ? 'B' : null;
    
    const playerA = allUsers.find(u => u.id === match.teamA[0]);
    const playerB = allUsers.find(u => u.id === match.teamB[0]);

    const teamAPlayers = match.teamA.map(id => allUsers.find(u => u.id === id)).filter(Boolean) as User[];
    const teamBPlayers = match.teamB.map(id => allUsers.find(u => u.id === id)).filter(Boolean) as User[];
    const teamAData = teams.find(t => t.id === match.teamAId);
    const teamBData = teams.find(t => t.id === match.teamBId);

    const hasRated = !!match.goodSportRatingsGiven?.[user.id];
    const canRate = isPlayerInMatch && match.status === MatchStatus.COMPLETED && !hasRated;
    
    const handleReportWin = () => {
        if (!userTeam) return;
        setConfirmationAction({
            type: 'win',
            title: 'Confirm Match Win',
            message: <p className="text-gray-600 dark:text-gray-300">Are you sure you want to report a <span className="font-bold text-green-500 dark:text-green-400">WIN</span> for this match? This action is final and will transfer the prize pool.</p>,
            confirmText: 'Yes, I Won',
            confirmVariant: 'primary',
            onConfirm: () => reportMatchResult(match.id, userTeam),
        });
    };

    const handleReportLoss = () => {
        if (!userTeam) return;
        const opponentTeam = userTeam === 'A' ? 'B' : 'A';
        setConfirmationAction({
            type: 'loss',
            title: 'Confirm Match Loss',
            message: <p className="text-gray-600 dark:text-gray-300">Are you sure you want to report a <span className="font-bold text-red-500 dark:text-red-400">LOSS</span>? This will award the prize pool to your opponent.</p>,
            confirmText: 'Yes, I Lost',
            confirmVariant: 'secondary',
            onConfirm: () => reportMatchResult(match.id, opponentTeam),
        });
    };

    const handleDispute = () => {
        setConfirmationAction({
            type: 'dispute',
            title: 'Open a Dispute',
            message: (
                <div className="space-y-2">
                    <p className="text-gray-600 dark:text-gray-300">Are you sure you want to open a dispute?</p>
                    <p className="text-sm text-yellow-800 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/50 p-3 rounded-lg">This will lock the match and require all players to submit video evidence within 24 hours.</p>
                </div>
            ),
            confirmText: 'Open Dispute',
            confirmVariant: 'danger',
            onConfirm: () => disputeMatch(match.id),
        });
    };

    const closeConfirmationModal = () => {
        setConfirmationAction(null);
    }
    
    const isDisputed = [MatchStatus.DISPUTED, MatchStatus.AWAITING_ADMIN_REVIEW, MatchStatus.AWAITING_OPPONENT_EVIDENCE].includes(match.status);
    const isPlayerLockedForThisMatch = isDisputed && isPlayerInMatch && user.isMatchmakingLocked;
    const platformInfo = PLATFORMS.find(p => p.id === match.platform);
    const PlatformIcon = platformInfo?.icon;


    return (
        <div className="space-y-6">
            <Button variant="secondary" onClick={() => navigate(-1)} className="inline-flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
            </Button>
            
            {isPlayerLockedForThisMatch && (
                <div className="bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-300 p-4 mb-6 rounded-r-lg shadow" role="alert">
                    <div className="flex items-center">
                        <AlertTriangle className="h-6 w-6 text-yellow-500 mr-4 flex-shrink-0"/>
                        <p className="font-semibold">Your matchmaking is locked until you submit evidence for this dispute.</p>
                    </div>
                </div>
            )}

            <Card>
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{match.game.name} Match</h1>
                    <div className="flex justify-center items-center flex-wrap gap-x-3 text-gray-500 dark:text-gray-400 mt-1">
                        <span>{match.teamSize}</span>
                        <span>&bull;</span>
                        <span>{match.region}</span>
                        <span>&bull;</span>
                        <span>ELO: {match.elo}</span>
                         {platformInfo && (
                            <>
                                <span>&bull;</span>
                                <span className="flex items-center gap-x-1.5">
                                    {PlatformIcon && <PlatformIcon className="h-4 w-4" />}
                                    {platformInfo.name}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {match.teamSize === MatchTeamSize.SOLO ? (
                    <div className="flex flex-col md:flex-row justify-around items-center my-8 p-4 space-y-8 md:space-y-0">
                        {playerA ? <PlayerCard user={playerA} /> : <EmptyPlayerCard />}
                        <div className="text-center mx-4 my-4 md:my-0">
                            <p className="text-6xl font-black text-gray-400 dark:text-gray-600">VS</p>
                            <div className="mt-4">
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Wager</p>
                                <p className="text-3xl font-bold text-yellow-500 dark:text-yellow-400 flex items-center justify-center">
                                    <Wallet className="h-6 w-6 mr-2" /> {match.wager} C
                                </p>
                            </div>
                        </div>
                        {playerB ? <PlayerCard user={playerB} /> : <EmptyPlayerCard />}
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row justify-around items-start my-8 gap-6">
                        <TeamDisplay 
                            players={teamAPlayers} 
                            teamData={teamAData}
                            teamName="A" 
                            maxTeamSize={maxTeamSize} 
                            matchId={match.id}
                            isPlayerInMatch={isPlayerInMatch}
                            status={match.status}
                            onJoin={joinTeam}
                            isInteractionLocked={isInteractionLocked}
                        />
                        <div className="text-center mx-4 self-center order-first md:order-none mb-6 md:mb-0">
                            <p className="text-4xl md:text-6xl font-black text-gray-400 dark:text-gray-600">VS</p>
                            <div className="mt-4">
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Wager (per player)</p>
                                <p className="text-3xl font-bold text-yellow-500 dark:text-yellow-400 flex items-center justify-center">
                                    <Wallet className="h-6 w-6 mr-2" /> {match.wager} C
                                </p>
                            </div>
                        </div>
                        <TeamDisplay 
                            players={teamBPlayers} 
                            teamData={teamBData}
                            teamName="B" 
                            maxTeamSize={maxTeamSize} 
                            matchId={match.id}
                            isPlayerInMatch={isPlayerInMatch}
                            status={match.status}
                            onJoin={joinTeam}
                            isInteractionLocked={isInteractionLocked}
                        />
                    </div>
                )}
            </Card>

            {isPlayerInMatch && isDisputed && <DisputeCenter match={match} />}

            {isPlayerInMatch && match.status === MatchStatus.IN_PROGRESS && (
                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">Report Match Result</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Button variant="primary" className="!bg-green-600 hover:!bg-green-500 !py-3 !text-base w-full" onClick={handleReportWin}>
                            <CheckCircle className="h-5 w-5 mr-2" /> I Won
                        </Button>
                        <Button variant="secondary" className="!py-3 !text-base w-full" onClick={handleReportLoss}>
                            <XCircle className="h-5 w-5 mr-2" /> I Lost
                        </Button>
                        <div className="sm:col-span-2">
                            <Button variant="danger" className="!py-3 !text-base w-full" onClick={handleDispute}>
                                <ShieldAlert className="h-5 w-5 mr-2" /> Open a Dispute
                            </Button>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
                        After your game is complete, report the result here. False reporting will result in a rating penalty.
                    </p>
                </Card>
            )}

            {match.status === MatchStatus.COMPLETED && (
                 <Card className="text-center">
                    <Award className="h-12 w-12 mx-auto text-yellow-400 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Match Completed</h2>
                    {match.winnerTeam ? (
                        <p className="text-gray-600 dark:text-gray-300 mt-2">Team {match.winnerTeam} was victorious!</p>
                    ) : (
                         <p className="text-gray-600 dark:text-gray-300 mt-2">The match was refunded.</p>
                    )}
                </Card>
            )}

            {canRate && (
                <Card className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Rate Your Opponent(s)</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Did you have a good game? Let them know by giving them a "Good Sport" rating.</p>
                    <Button onClick={() => rateOpponents(match.id)} className="!bg-brand-secondary hover:!bg-emerald-500">
                        <ThumbsUp className="h-5 w-5 mr-2" />
                        Rate as Good Sport
                    </Button>
                </Card>
            )}
            
            {hasRated && isPlayerInMatch && match.status === MatchStatus.COMPLETED && (
                 <Card className="text-center bg-gray-100 dark:bg-gray-900 border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center"><CheckCircle className="h-5 w-5 mr-2 text-green-500" /> Thanks for rating your opponents!</p>
                </Card>
            )}

            {isPlayerInMatch && <MatchChat matchId={match.id} />}

            <Modal
                isOpen={!!confirmationAction}
                onClose={closeConfirmationModal}
                title={confirmationAction?.title || ''}
                footer={
                    <>
                        <Button variant="secondary" onClick={closeConfirmationModal}>Cancel</Button>
                        <Button 
                            variant={confirmationAction?.confirmVariant} 
                            onClick={() => {
                                confirmationAction?.onConfirm();
                                closeConfirmationModal();
                            }}
                        >
                            {confirmationAction?.confirmText}
                        </Button>
                    </>
                }
            >
                {confirmationAction?.message}
            </Modal>
        </div>
    );
}

export default MatchDetailsPage;