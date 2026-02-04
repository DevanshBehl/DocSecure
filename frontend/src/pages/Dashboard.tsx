/**
 * AegisSign - Dashboard Page
 * 
 * Main user interface with Digital ID Card and document signing.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PenTool,
    Download,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Lock,
    FileSignature
} from 'lucide-react';
import { useAuth } from '../App';
import { documentApi } from '../services/api';
import DigitalIdCard from '../components/DigitalIdCard';
import FileUpload from '../components/FileUpload';

type SigningState = 'idle' | 'password' | 'signing' | 'success' | 'error';

export default function Dashboard() {
    const { user } = useAuth();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [signingState, setSigningState] = useState<SigningState>('idle');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [signedBlob, setSignedBlob] = useState<Blob | null>(null);
    const [signedFileName, setSignedFileName] = useState<string>('');

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
        setSigningState('idle');
        setError(null);
        setSignedBlob(null);
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        setSigningState('idle');
        setPassword('');
        setError(null);
        setSignedBlob(null);
    };

    const handleStartSigning = () => {
        setSigningState('password');
        setError(null);
    };

    const handleSign = async () => {
        if (!selectedFile || !password) return;

        setSigningState('signing');
        setError(null);

        try {
            const blob = await documentApi.sign(selectedFile, password);
            setSignedBlob(blob);
            setSignedFileName(selectedFile.name.replace('.pdf', '_signed.pdf'));
            setSigningState('success');
            setPassword('');
        } catch (err: unknown) {
            const error = err as { response?: { data?: Blob } };
            // Try to parse error from blob response
            if (error.response?.data instanceof Blob) {
                try {
                    const text = await error.response.data.text();
                    const json = JSON.parse(text);
                    setError(json.message || 'Signing failed');
                } catch {
                    setError('Failed to sign document');
                }
            } else {
                setError('Failed to sign document. Please check your password.');
            }
            setSigningState('error');
        }
    };

    const handleDownload = () => {
        if (!signedBlob) return;

        const url = window.URL.createObjectURL(signedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = signedFileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const handleReset = () => {
        setSelectedFile(null);
        setSigningState('idle');
        setPassword('');
        setError(null);
        setSignedBlob(null);
    };

    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold heading-gradient">Dashboard</h1>
                <p className="text-dark-400 mt-2">Sign documents with your cryptographic identity</p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column - Digital ID Card */}
                <div className="lg:col-span-1">
                    <DigitalIdCard email={user.email} publicKey={user.publicKey} />

                    {/* Quick Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-6 glass-card"
                    >
                        <h3 className="text-sm font-medium text-dark-400 mb-4">Security Info</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-dark-500">Algorithm</span>
                                <span className="font-mono text-aegis-accent">Ed25519</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-dark-500">Key Encryption</span>
                                <span className="font-mono text-aegis-accent">AES-256-GCM</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-dark-500">Hash Function</span>
                                <span className="font-mono text-aegis-accent">SHA-256</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column - Signing Area */}
                <div className="lg:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-aegis-primary/10">
                                <FileSignature className="w-6 h-6 text-aegis-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-dark-100">Sign Document</h2>
                                <p className="text-sm text-dark-500">Upload a PDF to digitally sign</p>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {/* File Upload State */}
                            {signingState === 'idle' && (
                                <motion.div
                                    key="upload"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <FileUpload
                                        onFileSelect={handleFileSelect}
                                        selectedFile={selectedFile}
                                        onClear={handleClearFile}
                                    />

                                    {selectedFile && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-6"
                                        >
                                            <button
                                                onClick={handleStartSigning}
                                                className="glass-button w-full flex items-center justify-center gap-2"
                                            >
                                                <PenTool className="w-5 h-5" />
                                                Sign This Document
                                            </button>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}

                            {/* Password Entry State */}
                            {signingState === 'password' && (
                                <motion.div
                                    key="password"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="p-4 rounded-xl bg-aegis-warning/10 border border-aegis-warning/20">
                                        <div className="flex items-start gap-3">
                                            <Lock className="w-5 h-5 text-aegis-warning mt-0.5" />
                                            <div>
                                                <p className="font-medium text-dark-200">Password Required</p>
                                                <p className="text-sm text-dark-500 mt-1">
                                                    Enter your password to decrypt your private signing key.
                                                    This is handled securely and never stored.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="signingPassword" className="block text-sm font-medium text-dark-300">
                                            Your Password
                                        </label>
                                        <input
                                            id="signingPassword"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            className="glass-input"
                                            autoFocus
                                        />
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex items-center gap-2 p-3 rounded-xl bg-aegis-danger/10 border border-aegis-danger/20 text-aegis-danger text-sm"
                                        >
                                            <AlertCircle className="w-4 h-4" />
                                            {error}
                                        </motion.div>
                                    )}

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setSigningState('idle');
                                                setPassword('');
                                                setError(null);
                                            }}
                                            className="glass-button-outline flex-1"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSign}
                                            disabled={!password}
                                            className="glass-button flex-1 flex items-center justify-center gap-2"
                                        >
                                            <PenTool className="w-5 h-5" />
                                            Sign Document
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Signing State */}
                            {signingState === 'signing' && (
                                <motion.div
                                    key="signing"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="py-12 text-center"
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                        className="inline-block mb-4"
                                    >
                                        <Loader2 className="w-12 h-12 text-aegis-primary" />
                                    </motion.div>
                                    <p className="text-lg font-medium text-dark-200">Signing Document...</p>
                                    <p className="text-sm text-dark-500 mt-2">
                                        Decrypting key and applying signature
                                    </p>
                                </motion.div>
                            )}

                            {/* Success State */}
                            {signingState === 'success' && signedBlob && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="py-8 text-center"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 200 }}
                                        className="inline-flex p-4 rounded-full bg-aegis-success/10 mb-4"
                                    >
                                        <CheckCircle2 className="w-12 h-12 text-aegis-success" />
                                    </motion.div>

                                    <h3 className="text-xl font-semibold text-dark-100 mb-2">
                                        Document Signed Successfully!
                                    </h3>
                                    <p className="text-dark-500 mb-6">
                                        Your signature has been embedded in the PDF metadata
                                    </p>

                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleDownload}
                                            className="glass-button flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-5 h-5" />
                                            Download Signed PDF
                                        </motion.button>
                                        <button
                                            onClick={handleReset}
                                            className="glass-button-outline"
                                        >
                                            Sign Another Document
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Error State */}
                            {signingState === 'error' && (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="py-8 text-center"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="inline-flex p-4 rounded-full bg-aegis-danger/10 mb-4"
                                    >
                                        <AlertCircle className="w-12 h-12 text-aegis-danger" />
                                    </motion.div>

                                    <h3 className="text-xl font-semibold text-dark-100 mb-2">
                                        Signing Failed
                                    </h3>
                                    <p className="text-dark-500 mb-6">
                                        {error || 'An error occurred while signing the document'}
                                    </p>

                                    <button
                                        onClick={() => setSigningState('password')}
                                        className="glass-button"
                                    >
                                        Try Again
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
