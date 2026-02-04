/**
 * AegisSign - Register Page
 * 
 * Registration form with key generation explanation.
 */

import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, ArrowRight, Loader2, Key, Info } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../App';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password strength
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authApi.signup(email, password);

            if (response.success && response.token && response.user) {
                login(response.token, response.user);
                navigate('/dashboard');
            } else {
                setError(response.message || 'Registration failed');
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'An error occurred during registration');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-aegis-primary/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-aegis-secondary/20 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative"
            >
                {/* Logo */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    className="flex justify-center mb-8"
                >
                    <div className="relative">
                        <Shield className="w-16 h-16 text-aegis-primary" />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-aegis-primary/30 blur-xl rounded-full"
                        />
                    </div>
                </motion.div>

                {/* Form Card */}
                <div className="glass-card">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold heading-gradient">Create Your Identity</h1>
                        <p className="text-dark-400 mt-2">Generate your cryptographic signing keys</p>
                    </div>

                    {/* Key Generation Info */}
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ delay: 0.3 }}
                        className="mb-6 p-4 rounded-xl bg-aegis-primary/5 border border-aegis-primary/20"
                    >
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-aegis-primary/10">
                                <Key className="w-4 h-4 text-aegis-primary" />
                            </div>
                            <div className="flex-1 text-sm">
                                <p className="font-medium text-dark-200 mb-1">Zero-Knowledge Security</p>
                                <p className="text-dark-500 text-xs">
                                    Your Ed25519 signing key will be encrypted with your password.
                                    We never store your private key in plain text.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email field */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-dark-300">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="glass-input pl-12"
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium text-dark-300">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 8 characters"
                                    required
                                    minLength={8}
                                    className="glass-input pl-12"
                                />
                            </div>
                            <div className="flex items-center gap-1 text-xs text-dark-500">
                                <Info className="w-3 h-3" />
                                <span>Used to encrypt your private signing key</span>
                            </div>
                        </div>

                        {/* Confirm Password field */}
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-300">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repeat your password"
                                    required
                                    className="glass-input pl-12"
                                />
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-xl bg-aegis-danger/10 border border-aegis-danger/20 text-aegis-danger text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Submit button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="glass-button w-full flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating Keys...
                                </>
                            ) : (
                                <>
                                    Create Identity
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Login link */}
                    <div className="mt-6 text-center text-sm text-dark-400">
                        Already have an account?{' '}
                        <Link to="/login" className="link-hover font-medium">
                            Sign in
                        </Link>
                    </div>
                </div>

                {/* Security note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-xs text-dark-600 mt-6"
                >
                    🔐 Your password never leaves your device unencrypted
                </motion.p>
            </motion.div>
        </div>
    );
}
