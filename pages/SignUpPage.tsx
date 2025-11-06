import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Swords } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';
import { MOCK_USER } from '../constants';
import Button from '../components/ui/Button';
import { UserRole, UserStatus } from '../types';

const AuthInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary w-full"
    />
);

const AuthLabel: React.FC<{ htmlFor: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{children}</label>
);

const SignUpPage = () => {
    const { login } = useAppContext();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!username || !email || !password) {
            setError('Please fill in all fields.');
            return;
        }
        
        const newUser = {
          id: `user-${Date.now()}`,
          username,
          email,
          avatarUrl: `https://i.pravatar.cc/150?u=${username}`,
          elo: { fortnite: 1500, cs2: 1500, brawlhalla: 1500 },
          rating: 100,
          credits: 100,
          role: UserRole.USER,
          status: UserStatus.ONLINE,
          friends: [],
          friendRequests: { sent: [], received: [] },
          linkedAccounts: { discord: `${username}#0000` },
          teamId: null,
          teamInvites: [],
          goodSportRating: 0,
          totalMatchesRated: 0,
          isMatchmakingLocked: false,
          hasCompletedOnboarding: false,
          primaryGames: [],
        };

        login(newUser);
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <Swords className="h-10 w-10 text-brand-primary" />
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white ml-2">BetDuel</h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Create your account to start competing</p>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <AuthLabel htmlFor="username">Username</AuthLabel>
                            <AuthInput id="username" name="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />
                        </div>
                        <div>
                            <AuthLabel htmlFor="email">Email Address</AuthLabel>
                            <AuthInput id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                        </div>
                        <div>
                            <AuthLabel htmlFor="password">Password</AuthLabel>
                            <AuthInput id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
                        </div>
                        {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
                        <div>
                            <Button type="submit" className="w-full">
                                Create Account
                            </Button>
                        </div>
                    </form>
                    <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-brand-primary hover:text-indigo-400">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;