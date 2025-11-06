import React from 'react';
import type { Match } from '../../types';
import Button from '../ui/Button';
import { X, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { useNavigate, Link } from 'react-router-dom';

interface JoinMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
}

const JoinMatchModal: React.FC<JoinMatchModalProps> = ({ isOpen, onClose, match }) => {
  const { user, allUsers, joinTeam } = useAppContext();
  const navigate = useNavigate();

  if (!isOpen || !user) return null;

  const opponentId = match.teamA.length > 0 ? match.teamA[0] : match.teamB[0];
  const opponent = allUsers.find(u => u.id === opponentId);

  const hasEnoughCredits = user.credits >= match.wager;
  const prizePool = match.wager * 2;
  const platformFee = prizePool * 0.05;
  const potentialWinnings = prizePool - platformFee;

  const handleConfirm = () => {
    if (!hasEnoughCredits) return;

    const teamToJoin = match.teamA.length === 0 ? 'A' : 'B';
    joinTeam(match.id, teamToJoin);
    
    onClose();
    navigate(`/matches/${match.id}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md relative border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Confirm Your Match</h2>
            <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <X size={24} />
            </button>
        </div>
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Game</span>
                <span className="font-semibold text-gray-900 dark:text-white">{match.game.name}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Opponent</span>
                <span className="font-semibold text-gray-900 dark:text-white">{opponent?.username || 'N/A'}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
            <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Your Wager</span>
                <span className="font-semibold text-red-500 dark:text-red-400 font-mono">-{match.wager.toFixed(2)} C</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Prize Pool</span>
                <span className="font-semibold text-gray-900 dark:text-white font-mono">{prizePool.toFixed(2)} C</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Platform Fee (5%)</span>
                <span className="font-semibold text-gray-900 dark:text-white font-mono">-{platformFee.toFixed(2)} C</span>
            </div>
            <div className="flex justify-between items-center text-lg">
                <span className="text-gray-700 dark:text-gray-300 font-bold">Potential Winnings</span>
                <span className="font-bold text-green-600 dark:text-green-400 font-mono">{potentialWinnings.toFixed(2)} C</span>
            </div>
             <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
             <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Your Current Balance</span>
                <span className={`font-semibold font-mono ${hasEnoughCredits ? 'text-gray-900 dark:text-white' : 'text-red-500 dark:text-red-400'}`}>{user.credits.toFixed(2)} C</span>
            </div>
            
            {!hasEnoughCredits && (
                <div className="bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-500 text-red-700 dark:text-red-300 text-sm rounded-lg p-3 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0"/>
                    <div>
                        <strong>Insufficient Funds.</strong>
                        <Link to="/wallet" onClick={onClose} className="underline ml-1 hover:text-red-800 dark:hover:text-white">Deposit credits</Link> to join.
                    </div>
                </div>
            )}
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="button" onClick={handleConfirm} disabled={!hasEnoughCredits}>
                Confirm & Lock Bet
            </Button>
        </div>
      </div>
    </div>
  );
};

export default JoinMatchModal;
