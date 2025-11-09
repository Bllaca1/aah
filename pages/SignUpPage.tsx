import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Swords } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegister } from '../src/hooks/useAuthQuery';
import { registerSchema, type RegisterFormData } from '../src/lib/validations/auth';
import Button from '../components/ui/Button';
import { Spinner } from '../src/components/ui/Spinner';

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
    const navigate = useNavigate();
    const registerMutation = useRegister();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            // Remove confirmPassword from the data sent to API
            const { confirmPassword, ...registerData } = data;
            await registerMutation.mutateAsync(registerData);
            navigate('/dashboard');
        } catch (error) {
            // Error is handled by the mutation hook with toast
        }
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
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <AuthLabel htmlFor="username">Username</AuthLabel>
                            <AuthInput
                                id="username"
                                type="text"
                                autoComplete="username"
                                {...register('username')}
                            />
                            {errors.username && (
                                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                    {errors.username.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <AuthLabel htmlFor="email">Email Address</AuthLabel>
                            <AuthInput
                                id="email"
                                type="email"
                                autoComplete="email"
                                {...register('email')}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <AuthLabel htmlFor="password">Password</AuthLabel>
                            <AuthInput
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                {...register('password')}
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <AuthLabel htmlFor="confirm-password">Confirm Password</AuthLabel>
                            <AuthInput
                                id="confirm-password"
                                type="password"
                                autoComplete="new-password"
                                {...register('confirmPassword')}
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                                {registerMutation.isPending ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Spinner size="sm" />
                                        Creating account...
                                    </span>
                                ) : (
                                    'Create Account'
                                )}
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
