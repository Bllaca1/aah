import React, { useState } from 'react';
import type { Match } from '../../types';
import { GAMES, PLATFORMS } from '../../constants';
import { MatchTeamSize, ServerRegion, Platform } from '../../types';
import Button from '../ui/Button';
import { X, Lock, Globe } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newMatch: Partial<Match>) => void;
}

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary w-full" />
);
const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary w-full" />
);
const FormLabel: React.FC<{htmlFor: string; children: React.ReactNode}> = ({htmlFor, children}) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{children}</label>
);


const CreateMatchModal: React.FC<CreateMatchModalProps> = ({ isOpen, onClose, onCreate }) => {
  const { user, teams } = useAppContext();
  const userTeam = teams.find(t => t.id === user?.teamId);

  const [formData, setFormData] = useState({
    game: GAMES[0].id,
    wager: 1.00,
    teamSize: MatchTeamSize.SOLO,
    region: ServerRegion.NA_EAST,
    privacy: 'public' as 'public' | 'private',
    platform: Platform.PC,
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
        teamAId: isTeamMatch && formData.teamSize !== MatchTeamSize.SOLO ? userTeam?.id : undefined,
        game: { id: formData.game } // The create function expects a game object, not just id
    };
    onCreate(newMatchData as any);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md relative border border-gray-200 dark:border-gray-700">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Match</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <FormLabel htmlFor="privacy">Privacy</FormLabel>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-200 dark:bg-gray-700 p-1">
                <button type="button" onClick={() => setFormData(p => ({...p, privacy: 'public'}))} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center justify-center transition-colors ${formData.privacy === 'public' ? 'bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white' : 'text-gray-500'}`}><Globe className="h-4 w-4 mr-2"/>Public</button>
                <button type="button" onClick={() => setFormData(p => ({...p, privacy: 'private'}))} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center justify-center transition-colors ${formData.privacy === 'private' ? 'bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white' : 'text-gray-500'}`}><Lock className="h-4 w-4 mr-2"/>Private</button>
            </div>
          </div>

          <div>
            <FormLabel htmlFor="game">Game</FormLabel>
            <FormSelect id="game" name="game" value={formData.game} onChange={handleChange}>
              {GAMES.map(game => <option key={game.id} value={game.id}>{game.name}</option>)}
            </FormSelect>
          </div>
           <div>
            <FormLabel htmlFor="platform">Platform</FormLabel>
            <FormSelect id="platform" name="platform" value={formData.platform} onChange={handleChange}>
              {PLATFORMS.map(platform => <option key={platform.id} value={platform.id}>{platform.name}</option>)}
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

          {userTeam && formData.teamSize !== MatchTeamSize.SOLO && (
            <div className="flex items-center space-x-2 pt-2">
                <input 
                    type="checkbox"
                    id="isTeamMatch"
                    name="isTeamMatch"
                    checked={isTeamMatch}
                    onChange={(e) => setIsTeamMatch(e.target.checked)}
                    className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-brand-primary focus:ring-brand-primary"
                />
                <label htmlFor="isTeamMatch" className="text-sm text-gray-700 dark:text-gray-300">
                    Create as a match for my team: <span className="font-bold">{userTeam.name}</span>
                </label>
            </div>
          )}

          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit">{formData.privacy === 'private' ? 'Create Private Lobby' : 'Create Public Match'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMatchModal;