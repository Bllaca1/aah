import React, { useState, useMemo } from 'react';
import MatchCard from '../components/matches/MatchCard';
import MatchFilters from '../components/matches/MatchFilters';
import { useAppContext } from '../hooks/useAppContext';
import type { Match } from '../types';
import { MatchTeamSize } from '../types';
import Button from '../components/ui/Button';
import CreateMatchModal from '../components/matches/CreateMatchModal';
import JoinMatchModal from '../components/matches/JoinMatchModal';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function MatchesPage() {
    const { matches, createMatch } = useAppContext();
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        game: 'all',
        teamSize: 'all',
        region: 'all',
    });
    
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [matchToJoin, setMatchToJoin] = useState<Match | null>(null);

    const filteredMatches = useMemo(() => {
        return matches.filter((match) => {
            if (filters.game !== 'all' && match.game.id !== filters.game) return false;
            if (filters.teamSize !== 'all' && match.teamSize !== filters.teamSize) return false;
            if (filters.region !== 'all' && match.region !== filters.region) return false;
            return match.status === 'Open';
        });
    }, [filters, matches]);

    const handleFilterChange = (newFilters: any) => {
        setFilters(newFilters);
    };
    
    const handleCreateMatch = (newMatchData: Partial<Match>) => {
        createMatch(newMatchData);
        setCreateModalOpen(false);
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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Match Lobby</h1>
                    <p className="text-gray-400 mt-1">Find your next challenge or create your own.</p>
                </div>
                <Button onClick={() => setCreateModalOpen(true)}>
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Create Match
                </Button>
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
                <div className="text-center py-16 bg-gray-800 rounded-lg">
                    <p className="text-gray-400">No open matches found with the current filters.</p>
                </div>
            )}
            
            <CreateMatchModal
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCreate={handleCreateMatch}
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