import React, { useState } from 'react';
import { GAMES } from '../../constants';
import type { Game } from '../../types';
import Button from '../ui/Button';
import { CheckCircle } from 'lucide-react';

interface GameSelectionModalProps {
  isOpen: boolean;
  onSave: (selectedGameIds: string[]) => void;
}

const GameCard: React.FC<{ game: Game; isSelected: boolean; onSelect: () => void }> = ({ game, isSelected, onSelect }) => (
  <div
    onClick={onSelect}
    className={`relative rounded-lg overflow-hidden cursor-pointer border-4 transition-all duration-200 ${isSelected ? 'border-brand-primary scale-105' : 'border-transparent hover:border-gray-400'}`}
  >
    <img src={game.imageUrl} alt={game.name} className="w-full h-40 object-cover" />
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end p-4">
      <h3 className="text-white text-lg font-bold">{game.name}</h3>
    </div>
    {isSelected && (
      <div className="absolute top-2 right-2 bg-brand-primary rounded-full p-1">
        <CheckCircle className="h-5 w-5 text-white" />
      </div>
    )}
  </div>
);

const GameSelectionModal: React.FC<GameSelectionModalProps> = ({ isOpen, onSave }) => {
  const [selectedGames, setSelectedGames] = useState<string[]>([]);

  const handleToggleGame = (gameId: string) => {
    setSelectedGames(prev =>
      prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId]
    );
  };

  const handleSave = () => {
    onSave(selectedGames);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
        <div className="p-6 text-center border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Select Your Games</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Choose the games you primarily play. This will customize your profile.</p>
        </div>
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {GAMES.map(game => (
              <GameCard
                key={game.id}
                game={game}
                isSelected={selectedGames.includes(game.id)}
                onSelect={() => handleToggleGame(game.id)}
              />
            ))}
          </div>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-center">
          <Button
            onClick={handleSave}
            disabled={selectedGames.length === 0}
            className="w-full max-w-xs py-3 text-base"
          >
            Save Selection
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameSelectionModal;
