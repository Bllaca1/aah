

import React, { useState } from 'react';
import type { Match } from '../../types';
import { GAMES } from '../../constants';
import { MatchTeamSize, ServerRegion } from '../../types';
import Button from '../ui/Button';
import { X } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newMatch: Partial<Match>) => void;
}

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary w-full" />
);
const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary w-full" />
);
const FormLabel: React.FC<{htmlFor: string; children: React.ReactNode}> = ({htmlFor, children}) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-400 mb-1">{children}</label>
);


const CreateMatchModal: React.FC<CreateMatchModalProps> = ({ isOpen, onClose, onCreate }) => {
  const { user, teams } = useAppContext();
  const userTeam = teams.find(t => t.id === user?.teamId);

  const [formData, setFormData] = useState({
    game: GAMES[0].id,
    wager: 1.00,
    teamSize: MatchTeamSize.SOLO,
    region: ServerRegion.NA_EAST,
  });
  const [isTeamMatch, setIsTeamMatch] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'wager' ? parseFloat(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMatchData = {
        ...formData,
        teamAId: isTeamMatch && formData.teamSize === MatchTeamSize.TEAM ? userTeam?.id : undefined,
        game: { id: formData.game } // The create function expects a game object, not just id
    };
    onCreate(newMatchData as any);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md relative border border-gray-700">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white mb-6">Create New Match</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <FormLabel htmlFor="game">Game</FormLabel>
            <FormSelect id="game" name="game" value={formData.game} onChange={handleChange}>
              {GAMES.map(game => <option key={game.id} value={game.id}>{game.name}</option>)}
            </FormSelect>
          </div>
          <div>
            <FormLabel htmlFor="wager">Wager (Credits)</FormLabel>
            <FormInput id="wager" name="wager" type="number" min="0.20" step="0.01" value={formData.wager} onChange={handleChange} required />
          </div>
          <div>
            <FormLabel htmlFor="teamSize">Team Size</FormLabel>
            <FormSelect id="teamSize" name="teamSize" value={formData.teamSize} onChange={handleChange}>
              {Object.values(MatchTeamSize).map(size => <option key={size} value={size}>{size}</option>)}
            </FormSelect>
          </div>
          <div>
            <FormLabel htmlFor="region">Server Region</FormLabel>
            <FormSelect id="region" name="region" value={formData.region} onChange={handleChange}>
              {Object.values(ServerRegion).map(region => <option key={region} value={region}>{region}</option>)}
            </FormSelect>
          </div>

          {userTeam && formData.teamSize === MatchTeamSize.TEAM && (
            <div className="flex items-center space-x-2 pt-2">
                <input 
                    type="checkbox"
                    id="isTeamMatch"
                    name="isTeamMatch"
                    checked={isTeamMatch}
                    onChange={(e) => setIsTeamMatch(e.target.checked)}
                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-brand-primary focus:ring-brand-primary"
                />
                <label htmlFor="isTeamMatch" className="text-sm text-gray-300">
                    Create as a match for my team: <span className="font-bold">{userTeam.name}</span>
                </label>
            </div>
          )}

          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit">Create Match</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMatchModal;