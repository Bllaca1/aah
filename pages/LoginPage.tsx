import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Swords } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';
import { MOCK_USER, MOCK_STAFF_USER } from '../constants';
import Button from '../components/ui/Button';

const AuthInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary w-full"
    />
);

const AuthLabel: React.FC<{ htmlFor: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{children}</label>
);

const LoginPage = () => {
    const { login } = useAppContext();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleQuickLogin = (userType: 'user' | 'staff') => {
        if (userType === 'staff') {
            login(MOCK_STAFF_USER);
        } else {
            login(MOCK_USER);
        }
        navigate('/dashboard');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Please enter email and password.');
            return;
        }
        // Mock login
        console.log('Logging in with:', { email, password });
        if (email === MOCK_STAFF_USER.email) {
            login(MOCK_STAFF_USER);
        } else {
            login(MOCK_USER);
        }
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
                    <p className="text-gray-500 dark:text-gray-400">Log in to your account</p>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <AuthLabel htmlFor="email">Email Address</AuthLabel>
                            <AuthInput id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                        </div>
                        <div>
                            <AuthLabel htmlFor="password">Password</AuthLabel>
                            <AuthInput id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
                        </div>
                        {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <Link to="/forgot-password" className="font-medium text-brand-primary hover:text-indigo-400">
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>
                        <div>
                            <Button type="submit" className="w-full">
                                Sign In
                            </Button>
                        </div>
                    </form>
                    <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Not a member?{' '}
                        <Link to="/signup" className="font-medium text-brand-primary hover:text-indigo-400">
                            Create an account
                        </Link>
                    </p>
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                    Or quick login for testing
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-3">
                            <Button variant="secondary" onClick={() => handleQuickLogin('user')}>
                                Login as User ({MOCK_USER.username})
                            </Button>
                            <Button variant="secondary" onClick={() => handleQuickLogin('staff')}>
                                Login as Staff ({MOCK_STAFF_USER.username})
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;