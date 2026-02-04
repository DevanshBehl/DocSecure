/**
 * AegisSign - Verify Page
 * 
 * Public verification page for signed documents.
 * No authentication required.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Upload } from 'lucide-react';
import { documentApi, VerifyResponse } from '../services/api';
import FileUpload from '../components/FileUpload';
import VerificationAnimation from '../components/VerificationAnimation';

type VerifyState = 'idle' | 'scanning' | 'success' | 'failure';

export default function Verify() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [verifyState, setVerifyState] = useState<VerifyState>('idle');
    const [result, setResult] = useState<VerifyResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = async (file: File) => {
        setSelectedFile(file);
        setVerifyState('scanning');
        setError(null);
        setResult(null);

        try {
            // Add a small delay for the scanning animation to be visible
            await new Promise(resolve => setTimeout(resolve, 1500));

            const response = await documentApi.verify(file);
            setResult(response);

            if (response.verified) {
                setVerifyState('success');
            } else {
                setVerifyState('failure');
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Verification failed');
            setVerifyState('failure');
        }
    };

    const handleClear = () => {
        setSelectedFile(null);
        setVerifyState('idle');
        setResult(null);
        setError(null);
    };

    const handleTryAnother = () => {
        handleClear();
    };

    return (
        <div className="min-h-screen">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-aegis-primary/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-aegis-secondary/20 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-3 group">
                            <Shield className="w-8 h-8 text-aegis-primary transition-transform group-hover:scale-110" />
                            <span className="text-xl font-bold heading-gradient">AegisSign</span>
                        </Link>

                        <Link
                            to="/login"
                            className="text-sm text-dark-400 hover:text-aegis-primary transition-colors"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold heading-gradient mb-4">
                            Verify Document
                        </h1>
                        <p className="text-dark-400 max-w-md mx-auto">
                            Upload a signed PDF to verify its authenticity and integrity.
                            No account required.
                        </p>
                    </div>

                    {/* Verification Card */}
                    <div className="glass-card">
                        {/* Upload section - shown when idle or as a way to upload new file */}
                        {(verifyState === 'idle' || !selectedFile) && (
                            <div className="mb-8">
                                <FileUpload
                                    onFileSelect={handleFileSelect}
                                    selectedFile={selectedFile}
                                    onClear={handleClear}
                                    error={error}
                                />
                            </div>
                        )}

                        {/* Verification Animation */}
                        {selectedFile && verifyState !== 'idle' && (
                            <div className="py-8">
                                <VerificationAnimation
                                    state={verifyState}
                                    signerPublicKey={result?.signerPublicKey}
                                    message={result?.message || error || undefined}
                                />

                                {/* Try another button */}
                                {(verifyState === 'success' || verifyState === 'failure') && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="mt-8 text-center"
                                    >
                                        <button
                                            onClick={handleTryAnother}
                                            className="glass-button-outline inline-flex items-center gap-2"
                                        >
                                            <Upload className="w-4 h-4" />
                                            Verify Another Document
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {/* Info section */}
                        {verifyState === 'idle' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="mt-8 pt-6 border-t border-white/10"
                            >
                                <h3 className="text-sm font-medium text-dark-300 mb-4">
                                    How Verification Works
                                </h3>
                                <div className="grid gap-4 text-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-aegis-primary/10 flex items-center justify-center text-aegis-primary text-xs font-bold">
                                            1
                                        </div>
                                        <div>
                                            <p className="text-dark-200 font-medium">Extract Signature</p>
                                            <p className="text-dark-500 text-xs mt-0.5">
                                                Read the embedded signature from PDF metadata
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-aegis-primary/10 flex items-center justify-center text-aegis-primary text-xs font-bold">
                                            2
                                        </div>
                                        <div>
                                            <p className="text-dark-200 font-medium">Compute Hash</p>
                                            <p className="text-dark-500 text-xs mt-0.5">
                                                Calculate SHA-256 hash of the original document content
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-aegis-primary/10 flex items-center justify-center text-aegis-primary text-xs font-bold">
                                            3
                                        </div>
                                        <div>
                                            <p className="text-dark-200 font-medium">Verify Signature</p>
                                            <p className="text-dark-500 text-xs mt-0.5">
                                                Validate Ed25519 signature against the hash and public key
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Back to sign link */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 text-center"
                    >
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-sm text-dark-500 hover:text-aegis-primary transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Sign in to sign your own documents
                        </Link>
                    </motion.div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 py-6 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-sm text-dark-600">
                        <p>AegisSign • Zero-Trust Digital Signatures</p>
                        <p className="font-mono text-xs mt-1">
                            Ed25519 • AES-256-GCM • SHA-256
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
