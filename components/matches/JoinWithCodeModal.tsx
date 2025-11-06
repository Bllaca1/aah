import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { KeyRound, ArrowRight } from 'lucide-react';

interface JoinWithCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JoinWithCodeModal: React.FC<JoinWithCodeModalProps> = ({ isOpen, onClose }) => {
  const { joinWithCode } = useAppContext();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleJoin = () => {
    setError('');
    if (!code.trim()) {
      setError('Please enter a code.');
      return;
    }

    const match = joinWithCode(code.toUpperCase().trim());
    if (match) {
      onClose();
      navigate(`/lobby/${match.id}`);
    } else {
      setError('Invalid code or the lobby is full. Please try again.');
    }
  };

  const handleClose = () => {
    setCode('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Join Private Lobby"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleJoin}>
            Join Lobby <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300">Enter the invite code you received to join the private match.</p>
        <div>
          <label htmlFor="invite-code" className="sr-only">Invite Code</label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="invite-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. XF4T9"
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 pr-3 pl-10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary uppercase"
              maxLength={5}
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
      </div>
    </Modal>
  );
};

export default JoinWithCodeModal;
