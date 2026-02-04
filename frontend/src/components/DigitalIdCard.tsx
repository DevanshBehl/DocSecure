/**
 * AegisSign - Digital ID Card Component
 * 
 * Displays user's cryptographic identity with public key and identicon.
 */

import { motion } from 'framer-motion';
import { Shield, Copy, Check, Key } from 'lucide-react';
import { useState } from 'react';

interface DigitalIdCardProps {
    email: string;
    publicKey: string;
}

// Simple identicon generator based on public key
function generateIdenticon(publicKey: string): string[] {
    const colors = [
        'from-indigo-500 to-purple-500',
        'from-cyan-500 to-blue-500',
        'from-emerald-500 to-teal-500',
        'from-amber-500 to-orange-500',
        'from-pink-500 to-rose-500',
    ];

    // Use first few bytes of public key to determine pattern
    const seed = parseInt(publicKey.substring(0, 8), 16);
    const colorIndex = seed % colors.length;

    return [colors[colorIndex]];
}

export default function DigitalIdCard({ email, publicKey }: DigitalIdCardProps) {
    const [copied, setCopied] = useState(false);
    const [gradientColors] = generateIdenticon(publicKey);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(publicKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Format public key for display (show first and last 8 chars)
    const formatPublicKey = (key: string) => {
        if (key.length <= 20) return key;
        return `${key.substring(0, 12)}...${key.substring(key.length - 12)}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card relative overflow-hidden"
        >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors} opacity-5`} />

            {/* Content */}
            <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-aegis-primary/10">
                            <Shield className="w-6 h-6 text-aegis-primary" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-dark-400">Digital Identity</h3>
                            <p className="text-lg font-semibold text-dark-100">{email}</p>
                        </div>
                    </div>

                    {/* Identicon */}
                    <div className="identicon w-14 h-14">
                        <div className="identicon-inner">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradientColors}`} />
                        </div>
                    </div>
                </div>

                {/* Public Key Section */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-dark-400">
                        <Key className="w-4 h-4" />
                        <span>Public Key (Ed25519)</span>
                    </div>

                    <div className="flex items-center gap-2 p-3 rounded-xl bg-dark-900/50 border border-white/5">
                        <code className="flex-1 crypto-text text-xs">
                            {formatPublicKey(publicKey)}
                        </code>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={copyToClipboard}
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                            title="Copy full public key"
                        >
                            {copied ? (
                                <Check className="w-4 h-4 text-aegis-success" />
                            ) : (
                                <Copy className="w-4 h-4 text-dark-400" />
                            )}
                        </motion.button>
                    </div>

                    {/* Full key on hover */}
                    <details className="group">
                        <summary className="text-xs text-dark-500 cursor-pointer hover:text-dark-400 transition-colors">
                            Show full public key
                        </summary>
                        <pre className="mt-2 p-3 rounded-xl bg-dark-900/50 border border-white/5 crypto-text text-xs overflow-x-auto">
                            {publicKey}
                        </pre>
                    </details>
                </div>

                {/* Status Badge */}
                <div className="mt-4 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aegis-success/10 text-aegis-success text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-aegis-success animate-pulse" />
                        Active Identity
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
