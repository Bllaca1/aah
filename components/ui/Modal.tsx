import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md relative border border-gray-700" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
        {footer && (
          <div className="bg-gray-900/50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
