import React, { useState, useMemo } from 'react';
import MatchCard from '../components/matches/MatchCard';
import MatchFilters from '../components/matches/MatchFilters';
import { useAppContext } from '../hooks/useAppContext';
import type { Match } from '../types';
import { MatchTeamSize, MatchStatus } from '../types';
import Button from '../components/ui/Button';
import CreateMatchModal from '../components/matches/CreateMatchModal';
import JoinMatchModal from '../components/matches/JoinMatchModal';
import { PlusCircle, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import JoinWithCodeModal from '../components/matches/JoinWithCodeModal';

function MatchesPage() {
    const { matches, createMatch, isInteractionLocked } = useAppContext();
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        game: 'all',
        teamSize: 'all',
        region: 'all',
        wager: 'all',
    });
    
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isJoinCodeModalOpen, setJoinCodeModalOpen] = useState(false);
    const [matchToJoin, setMatchToJoin] = useState<Match | null>(null);

    const filteredMatches = useMemo(() => {
        return matches.filter((match) => {
            if (filters.game !== 'all' && match.game.id !== filters.game) return false;
            if (filters.teamSize !== 'all' && match.teamSize !== filters.teamSize) return false;
            if (filters.region !== 'all' && match.region !== filters.region) return false;
            
            if (filters.wager !== 'all') {
                const wagerValue = match.wager;
                if (filters.wager === '1-10') {
                    if (wagerValue < 1 || wagerValue > 10) return false;
                } else if (filters.wager === '11-50') {
                    if (wagerValue < 11 || wagerValue > 50) return false;
                } else if (filters.wager === '51-100') {
                    if (wagerValue < 51 || wagerValue > 100) return false;
                } else if (filters.wager === '100+') {
                    if (wagerValue < 101) return false;
                }
            }
            
            return match.status === MatchStatus.OPEN;
        });
    }, [filters, matches]);

    const handleFilterChange = (newFilters: any) => {
        setFilters(newFilters);
    };
    
    const handleCreateMatch = (newMatchData: Partial<Match>) => {
        const newMatch = createMatch(newMatchData);
        setCreateModalOpen(false);
        if (newMatch && newMatch.privacy === 'private') {
            navigate(`/lobby/${newMatch.id}`);
        }
    };

    const handleViewClick = (match: Match) => {
        if (match.teamSize === MatchTeamSize.SOLO) {
            setMatchToJoin(match);
        } else {
            navigate(`/matches/${match.id}`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Match Lobby</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Find your next challenge or create your own.</p>
                </div>
                <div className="flex space-x-2">
                    <Button 
                        variant="secondary"
                        onClick={() => setJoinCodeModalOpen(true)}
                    >
                        <KeyRound className="h-5 w-5 mr-2" />
                        Join with Code
                    </Button>
                    <Button 
                        onClick={() => setCreateModalOpen(true)}
                        disabled={isInteractionLocked}
                        title={isInteractionLocked ? "Complete your active match or dispute before creating a new one." : "Create Match"}
                    >
                        <PlusCircle className="h-5 w-5 mr-2" />
                        Create Match
                    </Button>
                </div>
            </div>
            
            <MatchFilters onChange={handleFilterChange} />

            {filteredMatches.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredMatches.map((match: Match) => (
                        <MatchCard 
                            key={match.id} 
                            match={match} 
                            onViewClick={handleViewClick} 
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-200 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">No open matches found with the current filters.</p>
                </div>
            )}
            
            <CreateMatchModal
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCreate={handleCreateMatch}
            />
            <JoinWithCodeModal
                isOpen={isJoinCodeModalOpen}
                onClose={() => setJoinCodeModalOpen(false)}
            />
            {matchToJoin && (
                <JoinMatchModal 
                    isOpen={!!matchToJoin}
                    onClose={() => setMatchToJoin(null)}
                    match={matchToJoin}
                />
            )}
        </div>
    );
}

export default MatchesPage;