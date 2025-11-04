import React, { useState, useEffect, useRef } from 'react';
import type { User } from '../../types';
import Button from '../ui/Button';
import { X, Upload } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (updatedUser: Partial<User>) => void;
}

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary w-full" />
);
const FormLabel: React.FC<{htmlFor?: string; children: React.ReactNode}> = ({htmlFor, children}) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-400 mb-1">{children}</label>
);

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    username: user.username,
    avatarUrl: user.avatarUrl,
    discord: user.linkedAccounts.discord,
    fortnite: user.linkedAccounts.fortnite || '',
    cs2: user.linkedAccounts.cs2 || '',
    brawlhalla: user.linkedAccounts.brawlhalla || '',
  });

  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        username: user.username,
        avatarUrl: user.avatarUrl,
        discord: user.linkedAccounts.discord,
        fortnite: user.linkedAccounts.fortnite || '',
        cs2: user.linkedAccounts.cs2 || '',
        brawlhalla: user.linkedAccounts.brawlhalla || '',
      });
    }
  }, [isOpen, user]);
  
  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Simple size check (e.g., 2MB)
      if (file.size > 2 * 1024 * 1024) {
          alert('File is too large! Please select an image under 2MB.');
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: Partial<User> = {
        username: formData.username,
        avatarUrl: formData.avatarUrl,
        linkedAccounts: {
            discord: formData.discord,
            fortnite: formData.fortnite,
            cs2: formData.cs2,
            brawlhalla: formData.brawlhalla,
        }
    };
    onSave(updatedUser);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg relative border border-gray-700 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
            <h2 className="text-xl font-bold text-white">Edit Your Profile</h2>
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-700">
              <X size={24} />
            </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow">
            <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-6">
                
                <div>
                    <FormLabel>Profile Picture</FormLabel>
                    <div className="flex items-center space-x-4 mt-2">
                        <img src={formData.avatarUrl} alt="Avatar Preview" className="w-20 h-20 rounded-full object-cover border-2 border-gray-600"/>
                        <div>
                            <input
                              id="avatar-upload"
                              ref={avatarInputRef}
                              type="file"
                              accept="image/png, image/jpeg, image/webp"
                              onChange={handleAvatarChange}
                              className="hidden"
                            />
                            <Button type="button" variant="secondary" onClick={() => avatarInputRef.current?.click()}>
                                <Upload className="h-4 w-4 mr-2"/>
                                Upload Image
                            </Button>
                             <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP. Max 2MB.</p>
                        </div>
                    </div>
                </div>

                <div>
                  <FormLabel htmlFor="username">Username</FormLabel>
                  <FormInput id="username" name="username" type="text" value={formData.username} onChange={handleChange} required />
                </div>
                
                <div className="pt-2">
                   <h3 className="text-lg font-semibold text-white mb-2 border-b border-gray-700 pb-2">Linked Accounts</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                          <FormLabel htmlFor="discord">Discord</FormLabel>
                          <FormInput id="discord" name="discord" type="text" placeholder="YourName#1234" value={formData.discord} onChange={handleChange} required />
                      </div>
                       <div>
                          <FormLabel htmlFor="fortnite">Fortnite</FormLabel>
                          <FormInput id="fortnite" name="fortnite" type="text" placeholder="EpicGames Username" value={formData.fortnite} onChange={handleChange} />
                      </div>
                       <div>
                          <FormLabel htmlFor="cs2">CS2</FormLabel>
                          <FormInput id="cs2" name="cs2" type="text" placeholder="Steam Username" value={formData.cs2} onChange={handleChange} />
                      </div>
                       <div>
                          <FormLabel htmlFor="brawlhalla">Brawlhalla</FormLabel>
                          <FormInput id="brawlhalla" name="brawlhalla" type="text" placeholder="BH Username" value={formData.brawlhalla} onChange={handleChange} />
                      </div>
                   </div>
                </div>
            </form>
        </div>

        <div className="p-4 bg-gray-900/50 flex justify-end space-x-3 border-t border-gray-700 flex-shrink-0">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="edit-profile-form">Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
