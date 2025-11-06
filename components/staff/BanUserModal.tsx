import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import type { User } from '../../types';

interface BanUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    userToBan: User;
}

type BanDuration = '24_hours' | '7_days' | '30_days' | 'permanent';

const BanUserModal: React.FC<BanUserModalProps> = ({ isOpen, onClose, userToBan }) => {
    const { banUser } = useAppContext();
    const [reason, setReason] = useState('');
    const [duration, setDuration] = useState<BanDuration>('24_hours');

    const handleSubmit = () => {
        if (!reason.trim()) {
            alert('A reason for the ban is required.');
            return;
        }
        banUser(userToBan.id, reason, duration);
        onClose();
    };

    const durationOptions: { value: BanDuration, label: string }[] = [
        { value: '24_hours', label: '24 Hours' },
        { value: '7_days', label: '7 Days' },
        { value: '30_days', label: '30 Days' },
        { value: 'permanent', label: 'Permanent' },
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Ban User: ${userToBan.username}`}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="danger" onClick={handleSubmit}>Apply Ban</Button>
                </>
            }
        >
            <div className="space-y-4">
                <div>
                    <label htmlFor="ban-reason" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Reason for Ban
                    </label>
                    <textarea
                        id="ban-reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                        className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        placeholder="e.g., Cheating, toxic behavior, etc."
                    />
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Ban Duration
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2 rounded-lg bg-gray-200 dark:bg-gray-700 p-1">
                        {durationOptions.map(opt => (
                            <button 
                                key={opt.value} 
                                type="button" 
                                onClick={() => setDuration(opt.value)} 
                                className={`w-full px-4 py-2 text-sm font-semibold rounded-md transition-colors ${duration === opt.value ? 'bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white' : 'text-gray-500'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default BanUserModal;