import React from 'react';
import { Link } from 'react-router-dom';
import { Ban, Swords } from 'lucide-react';

const BannedPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md text-center">
                 <div className="flex items-center justify-center mb-8">
                    <Swords className="h-10 w-10 text-brand-primary" />
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white ml-2">BetDuel</h1>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-red-500/30 rounded-lg shadow-lg p-8">
                    <Ban className="h-20 w-20 text-red-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Account Locked</h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-4">
                        Your account has been suspended or permanently banned due to a violation of our terms of service.
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                        If this is a temporary suspension, you will be able to log in once the suspension period has ended. For permanent bans or to appeal, please contact support.
                    </p>
                    <Link
                        to="/login"
                        className="mt-8 inline-block w-full px-4 py-2 rounded-md font-semibold text-sm transition-all duration-200 bg-brand-primary text-white hover:bg-indigo-500"
                    >
                        Return to Login Page
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BannedPage;
