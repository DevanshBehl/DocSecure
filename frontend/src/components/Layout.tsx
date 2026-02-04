/**
 * AegisSign - Layout Component
 * 
 * Main layout wrapper with navigation header.
 */

import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, LogOut, FileCheck } from 'lucide-react';
import { useAuth } from '../App';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass border-b border-white/10 sticky top-0 z-50"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/dashboard" className="flex items-center gap-3 group">
                            <div className="relative">
                                <Shield className="w-8 h-8 text-aegis-primary transition-transform group-hover:scale-110" />
                                <div className="absolute inset-0 bg-aegis-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <span className="text-xl font-bold heading-gradient">AegisSign</span>
                        </Link>

                        {/* Navigation */}
                        <nav className="flex items-center gap-6">
                            <Link
                                to="/verify"
                                className="flex items-center gap-2 text-dark-300 hover:text-aegis-primary transition-colors"
                            >
                                <FileCheck className="w-4 h-4" />
                                <span className="hidden sm:inline">Verify Document</span>
                            </Link>

                            {user && (
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-dark-400 hidden md:block">
                                        {user.email}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 text-dark-300 hover:text-aegis-danger transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span className="hidden sm:inline">Logout</span>
                                    </button>
                                </div>
                            )}
                        </nav>
                    </div>
                </div>
            </motion.header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-dark-500">
                        <p>© 2026 AegisSign. Zero-Trust Digital Signatures.</p>
                        <p className="font-mono text-xs">
                            Ed25519 • AES-256-GCM • SHA-256
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
