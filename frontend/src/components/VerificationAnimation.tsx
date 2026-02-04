/**
 * AegisSign - Verification Animation Component
 * 
 * Framer Motion animations for verification states:
 * - Scanning: Moving bar effect during verification
 * - Success: Green shield pulse
 * - Failure: Red glitch effect
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldCheck, ShieldX, FileText, Scan } from 'lucide-react';

type VerificationState = 'idle' | 'scanning' | 'success' | 'failure';

interface VerificationAnimationProps {
    state: VerificationState;
    signerPublicKey?: string;
    message?: string;
}

// Scanning animation component
function ScanningAnimation() {
    return (
        <div className="relative w-48 h-64 mx-auto">
            {/* Document icon */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
            >
                <div className="relative">
                    <FileText className="w-24 h-32 text-dark-600" strokeWidth={1} />

                    {/* Scanning bar */}
                    <motion.div
                        initial={{ top: 0 }}
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-aegis-primary to-transparent"
                        style={{ boxShadow: '0 0 20px rgba(99, 102, 241, 0.8)' }}
                    />

                    {/* Scanning glow */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        className="absolute inset-0 bg-aegis-primary/10 rounded-lg"
                    />
                </div>
            </motion.div>

            {/* Scan icon */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2"
            >
                <Scan className="w-8 h-8 text-aegis-primary animate-pulse" />
            </motion.div>
        </div>
    );
}

// Success animation component
function SuccessAnimation() {
    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="relative"
        >
            {/* Outer glow ring */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-aegis-success/20 blur-xl"
                style={{ width: '150%', height: '150%', left: '-25%', top: '-25%' }}
            />

            {/* Shield icon with checkmark */}
            <motion.div
                initial={{ rotateY: 180 }}
                animate={{ rotateY: 0 }}
                transition={{ type: 'spring', stiffness: 100 }}
                className="relative p-6 rounded-3xl bg-aegis-success/10 border border-aegis-success/30"
            >
                <ShieldCheck className="w-20 h-20 text-aegis-success" />

                {/* Sparkle effects */}
                {[...Array(4)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                        transition={{
                            delay: 0.5 + i * 0.1,
                            duration: 0.6,
                            repeat: Infinity,
                            repeatDelay: 2,
                        }}
                        className="absolute w-2 h-2 rounded-full bg-aegis-success"
                        style={{
                            top: `${20 + i * 20}%`,
                            left: i % 2 === 0 ? '-10%' : '100%',
                        }}
                    />
                ))}
            </motion.div>
        </motion.div>
    );
}

// Failure animation component (glitch effect)
function FailureAnimation() {
    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
        >
            {/* Glitch container */}
            <motion.div
                animate={{
                    x: [0, -2, 2, -2, 0],
                    filter: ['hue-rotate(0deg)', 'hue-rotate(90deg)', 'hue-rotate(0deg)'],
                }}
                transition={{ duration: 0.3, repeat: 3 }}
                className="relative"
            >
                {/* Main shield */}
                <div className="relative p-6 rounded-3xl bg-aegis-danger/10 border border-aegis-danger/30">
                    <ShieldX className="w-20 h-20 text-aegis-danger" />
                </div>

                {/* Glitch layers */}
                <motion.div
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 0.1, repeat: 6, delay: 0.2 }}
                    className="absolute inset-0 p-6 rounded-3xl"
                    style={{ transform: 'translate(-3px, 0)', clipPath: 'inset(10% 0 60% 0)' }}
                >
                    <ShieldX className="w-20 h-20 text-cyan-500" />
                </motion.div>

                <motion.div
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 0.1, repeat: 6, delay: 0.3 }}
                    className="absolute inset-0 p-6 rounded-3xl"
                    style={{ transform: 'translate(3px, 0)', clipPath: 'inset(40% 0 30% 0)' }}
                >
                    <ShieldX className="w-20 h-20 text-yellow-500" />
                </motion.div>
            </motion.div>

            {/* Error pulse */}
            <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 rounded-3xl border-2 border-aegis-danger"
            />
        </motion.div>
    );
}

// Idle state
function IdleAnimation() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
        >
            <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="p-6 rounded-3xl bg-dark-800/50 border border-white/10"
            >
                <Shield className="w-20 h-20 text-dark-500" />
            </motion.div>
        </motion.div>
    );
}

export default function VerificationAnimation({
    state,
    signerPublicKey,
    message,
}: VerificationAnimationProps) {
    return (
        <div className="flex flex-col items-center gap-6">
            <AnimatePresence mode="wait">
                <motion.div
                    key={state}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                    {state === 'idle' && <IdleAnimation />}
                    {state === 'scanning' && <ScanningAnimation />}
                    {state === 'success' && <SuccessAnimation />}
                    {state === 'failure' && <FailureAnimation />}
                </motion.div>
            </AnimatePresence>

            {/* Status text */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={state + message}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center"
                >
                    {state === 'idle' && (
                        <p className="text-dark-400">Upload a signed document to verify</p>
                    )}

                    {state === 'scanning' && (
                        <div className="space-y-2">
                            <p className="text-aegis-primary font-medium">Verifying signature...</p>
                            <p className="text-sm text-dark-500">Analyzing document integrity</p>
                        </div>
                    )}

                    {state === 'success' && (
                        <div className="space-y-3">
                            <p className="text-aegis-success font-semibold text-lg">
                                ✓ Signature Verified
                            </p>
                            {message && (
                                <p className="text-dark-300">{message}</p>
                            )}
                            {signerPublicKey && (
                                <div className="mt-4 p-3 rounded-xl bg-dark-900/50 border border-aegis-success/20">
                                    <p className="text-xs text-dark-500 mb-1">Signer's Public Key</p>
                                    <code className="crypto-text text-xs block truncate max-w-xs">
                                        {signerPublicKey}
                                    </code>
                                </div>
                            )}
                        </div>
                    )}

                    {state === 'failure' && (
                        <div className="space-y-2">
                            <p className="text-aegis-danger font-semibold text-lg">
                                ✗ Verification Failed
                            </p>
                            {message && (
                                <p className="text-dark-400 text-sm">{message}</p>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
