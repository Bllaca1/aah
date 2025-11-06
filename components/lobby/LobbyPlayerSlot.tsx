import React from 'react';
import type { User } from '../../types';
import { CheckCircle, CircleDashed } from 'lucide-react';

interface LobbyPlayerSlotProps {
  user?: User;
  isReady: boolean;
}

const LobbyPlayerSlot: React.FC<LobbyPlayerSlotProps> = ({ user, isReady }) => {
  if (!user) {
    return (
      <div className="flex items-center p-2 bg-gray-100 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg h-[60px]">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
        <div className="ml-3">
          <p className="font-semibold text-gray-500">Empty Slot...</p>
        </div>
      </div>
    );
  }

  // FIX: Removed explicit types from reduce callback to allow TypeScript to infer them correctly, resolving an arithmetic operation error.
  const overallElo = Object.values(user.elo).length > 0 ? Math.round(Object.values(user.elo).reduce((a, b) => a + b, 0) / Object.values(user.elo).length) : 1500;

  return (
    <div className={`flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg h-[60px] transition-all ${isReady ? 'ring-2 ring-green-500' : ''}`}>
      <div className="flex items-center space-x-3">
        <img src={user.avatarUrl} alt={user.username} className="w-10 h-10 rounded-full" />
        <div>
          <p className="font-semibold text-gray-900 dark:text-white truncate">{user.username}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">ELO: {overallElo}</p>
        </div>
      </div>
      {isReady ? (
        <div className="flex items-center text-green-500 dark:text-green-400 text-sm font-semibold">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span>Ready</span>
        </div>
      ) : (
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm font-semibold">
           <CircleDashed className="h-5 w-5 mr-2 animate-pulse"/>
           <span>Waiting</span>
        </div>
      )}
    </div>
  );
};

export default LobbyPlayerSlot;