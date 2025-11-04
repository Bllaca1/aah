import React from 'react';
import { UserStatus } from '../../types';

interface PresenceIndicatorProps {
  status: UserStatus;
  size?: 'sm' | 'md';
}

const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({ status, size = 'md' }) => {
  const statusColors = {
    [UserStatus.ONLINE]: 'bg-green-500',
    [UserStatus.OFFLINE]: 'bg-gray-500',
    [UserStatus.AWAY]: 'bg-yellow-500',
  };
  const sizeClasses = {
      sm: 'h-2.5 w-2.5',
      md: 'h-3.5 w-3.5'
  }

  return (
    <span className={`block rounded-full ${sizeClasses[size]} ${statusColors[status]} ring-2 ring-gray-800`} />
  );
};

export default PresenceIndicator;
