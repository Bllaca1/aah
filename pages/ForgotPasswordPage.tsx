import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Swords, MailCheck } from 'lucide-react';
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

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Password reset requested for:', email);
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <Swords className="h-10 w-10 text-brand-primary" />
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white ml-2">BetDuel</h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Reset your password</p>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-8">
                    {submitted ? (
                         <div className="text-center">
                            <MailCheck className="h-16 w-16 text-green-400 mx-auto mb-4"/>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Check your email</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">We've sent a password reset link to <span className="font-semibold text-gray-800 dark:text-white">{email}</span>.</p>
                             <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                <Link to="/login" className="font-medium text-brand-primary hover:text-indigo-400">
                                    &larr; Back to Sign In
                                </Link>
                            </p>
                         </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <AuthLabel htmlFor="email">Email Address</AuthLabel>
                                <AuthInput id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                            </div>
                            <div>
                                <Button type="submit" className="w-full">
                                    Send Reset Link
                                </Button>
                            </div>
                        </form>
                    )}
                     {!submitted && (
                        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                            Remembered your password?{' '}
                            <Link to="/login" className="font-medium text-brand-primary hover:text-indigo-400">
                                Sign In
                            </Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
