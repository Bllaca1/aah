import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowLeft, RefreshCw, Trophy, Youtube, MessageSquare, Wallet } from 'lucide-react';
import { MatchStatus, User as UserType, Team as TeamType } from '../types';
import Modal from '../components/ui/Modal';

const getYoutubeEmbedUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    let videoId = '';
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      videoId = urlObj.searchParams.get('v') || '';
      if (!videoId && urlObj.pathname.startsWith('/embed/')) {
        videoId = urlObj.pathname.split('/')[2];
      }
    }
    
    if (videoId) {
      const cleanVideoId = videoId.split('?')[0];
      return `https://www.youtube.com/embed/${cleanVideoId}`;
    }
    return null;
  } catch (error) {
    console.error("Invalid URL for YouTube embed:", url, error);
    return null;
  }
};


const EvidenceCard: React.FC<{ player: UserType, evidence?: { youtubeLink: string, message: string } }> = ({ player, evidence }) => {
    const embedUrl = evidence?.youtubeLink ? getYoutubeEmbedUrl(evidence.youtubeLink) : null;

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg space-y-4">
            <div className="flex items-center space-x-3">
                <img src={player.avatarUrl} alt={player.username} className="w-10 h-10 rounded-full" />
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{player.username}</h4>
            </div>

            {evidence ? (
                <>
                    {embedUrl ? (
                        <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                            <iframe
                                width="100%"
                                height="100%"
                                src={embedUrl}
                                title={`YouTube video for ${player.username}`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            ></iframe>
                        </div>
                    ) : (
                         <div className="flex items-center text-sm p-2 bg-gray-200 dark:bg-gray-800 rounded-md">
                            <Youtube className="h-5 w-5 mr-2 text-red-500 flex-shrink-0"/>
                            <a href={evidence.youtubeLink} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline truncate">{evidence.youtubeLink}</a>
                        </div>
                    )}
                    
                    <div className="flex items-start">
                        <MessageSquare className="h-5 w-5 mr-2 text-gray-500 mt-0.5 flex-shrink-0"/>
                        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap text-sm">{evidence.message || 'No message provided.'}</p>
                    </div>
                </>
            ) : (
                 <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                    <p>No evidence submitted.</p>
                </div>
            )}
        </div>
    );
};

function StaffDisputeReviewPage() {
    const { matchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();
    const { matches, allUsers, teams, updateUserById, reportMatchResult, resolveMatchAndUnlockPlayers } = useAppContext();

    const [confirmation, setConfirmation] = useState<{ type: 'settleA' | 'settleB' | 'refund', title: string, message: string, onConfirm: () => void } | null>(null);

    const match = matches.find(m => m.id === matchId);

    if (!match) return <Card><p>Match not found.</p></Card>;

    const teamAPlayers = match.teamA.map(id => allUsers.find(u => u.id === id)).filter(Boolean) as UserType[];
    const teamBPlayers = match.teamB.map(id => allUsers.find(u => u.id === id)).filter(Boolean) as UserType[];
    const teamAData = teams.find(t => t.id === match.teamAId);
    const teamBData = teams.find(t => t.id === match.teamBId);
    const evidence = match.disputeDetails?.playerEvidence || {};

    const handleSettle = (winningTeam: 'A' | 'B') => {
        const loserTeamIds = winningTeam === 'A' ? match.teamB : match.teamA;
        loserTeamIds.forEach(loserId => {
            const loserData = allUsers.find(u => u.id === loserId);
            if (loserData) {
                updateUserById(loserId, { rating: Math.max(0, loserData.rating - 25) });
            }
        });
        reportMatchResult(match.id, winningTeam);
        navigate('/staff/dashboard');
    };

    const handleRefund = () => {
        resolveMatchAndUnlockPlayers(match.id, { status: MatchStatus.REFUNDED, winnerTeam: null });
        navigate('/staff/dashboard');
    };
    
    const teamAPlayerNames = teamAPlayers.map(p => p.username).join(', ');
    const teamBPlayerNames = teamBPlayers.map(p => p.username).join(', ');
    
    const teamADisplayName = teamAData?.name || teamAPlayerNames;
    const teamBDisplayName = teamBData?.name || teamBPlayerNames;

    return (
        <div className="space-y-6">
            <Button variant="secondary" onClick={() => navigate(-1)} className="inline-flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
            </Button>

            <Card>
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Review Dispute</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-mono text-sm">Match ID: {match.id}</p>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center border-y border-gray-200 dark:border-gray-700 py-4">
                    <div><p className="font-semibold text-gray-500 dark:text-gray-400">Game</p><p className="text-xl font-bold">{match.game.name}</p></div>
                    <div><p className="font-semibold text-gray-500 dark:text-gray-400">Wager</p><p className="text-xl font-bold flex items-center justify-center gap-2"><Wallet/>{match.wager} C</p></div>
                    <div><p className="font-semibold text-gray-500 dark:text-gray-400">Players</p><p className="text-xl font-bold">{teamAPlayers.length + teamBPlayers.length}</p></div>
                </div>
            </Card>

            <Card>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Submitted Evidence</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2 text-center text-blue-500">Team A: {teamADisplayName}</h3>
                        {teamAPlayers.map(player => <EvidenceCard key={player.id} player={player} evidence={evidence[player.id]}/>)}
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold mb-2 text-center text-red-500">Team B: {teamBDisplayName}</h3>
                        {teamBPlayers.map(player => <EvidenceCard key={player.id} player={player} evidence={evidence[player.id]}/>)}
                    </div>
                </div>
            </Card>
            
            <Card>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">Resolution Actions</h2>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                     <Button 
                        onClick={() => setConfirmation({ type: 'settleA', title: `Confirm Win for ${teamADisplayName}`, message: `This will award the win to ${teamADisplayName} and penalize ${teamBDisplayName}. Are you sure?`, onConfirm: () => handleSettle('A') })} 
                        className="!bg-green-600 hover:!bg-green-500 w-full sm:w-auto"
                    >
                        <Trophy className="h-5 w-5 mr-2"/> Declare {teamADisplayName} Winner
                    </Button>
                     <Button 
                        onClick={() => setConfirmation({ type: 'settleB', title: `Confirm Win for ${teamBDisplayName}`, message: `This will award the win to ${teamBDisplayName} and penalize ${teamADisplayName}. Are you sure?`, onConfirm: () => handleSettle('B') })}
                        className="!bg-blue-600 hover:!bg-blue-500 w-full sm:w-auto"
                    >
                        <Trophy className="h-5 w-5 mr-2"/> Declare {teamBDisplayName} Winner
                    </Button>
                     <Button 
                        onClick={() => setConfirmation({ type: 'refund', title: 'Confirm Refund', message: 'This will refund the wager to all players and close the dispute without penalty. Are you sure?', onConfirm: handleRefund })}
                        variant="secondary" 
                        className="w-full sm:w-auto"
                    >
                         <RefreshCw className="h-5 w-5 mr-2"/> Rule as a Draw (Refund Both)
                    </Button>
                </div>
            </Card>

            <Modal
                isOpen={!!confirmation}
                onClose={() => setConfirmation(null)}
                title={confirmation?.title || ''}
                footer={<>
                    <Button variant="secondary" onClick={() => setConfirmation(null)}>Cancel</Button>
                    <Button variant="danger" onClick={() => { confirmation?.onConfirm(); setConfirmation(null); }}>Confirm Action</Button>
                </>}
            >
                <p className="text-gray-600 dark:text-gray-300">{confirmation?.message}</p>
            </Modal>
        </div>
    );
}

export default StaffDisputeReviewPage;