import { motion } from 'framer-motion';
import { Shield, Key, Lock, CheckCircle, ArrowRight, FileCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative px-4 pt-20 pb-32 overflow-hidden sm:px-6 lg:px-8 flex items-center justify-center min-h-[80vh]">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                <div className="relative max-w-5xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-sm border rounded-full text-aegis-primary border-aegis-primary/30 bg-aegis-primary/10"
                    >
                        <Shield className="w-4 h-4" />
                        <span>Zero-Trust Architecture</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-6"
                    >
                        Secure Digital Signatures with{' '}
                        <span className="heading-gradient">Absolute Trust</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="max-w-2xl mx-auto mb-10 text-xl text-dark-300"
                    >
                        AegisSign implements Ed25519 elliptic curve cryptography to sign and verify your documents securely. Your private keys never touch our servers in plain text.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col justify-center gap-4 sm:flex-row"
                    >
                        <Link to="/register" className="glass-button flex items-center justify-center gap-2">
                            Get Started Free
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link to="/docs" className="glass-button-outline flex items-center justify-center gap-2">
                            Read Documentation
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 relative z-10 bg-dark-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Why AegisSign?</h2>
                        <p className="text-dark-400 max-w-2xl mx-auto">
                            Built with state-of-the-art cryptographic primitives to ensure your documents remain authentic and untampered.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="glass-card flex flex-col items-center text-center space-y-4"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-2">
                                <Key className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-semibold">Ed25519 Cryptography</h3>
                            <p className="text-dark-400 text-sm">
                                Utilizes the fast and highly secure Ed25519 signature scheme for generating cryptographic keypairs and signing PDFs.
                            </p>
                        </motion.div>

                        {/* Feature 2 */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="glass-card flex flex-col items-center text-center space-y-4 relative overflow-hidden"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-2">
                                <Lock className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-semibold">Zero-Knowledge</h3>
                            <p className="text-dark-400 text-sm">
                                Your private keys are encrypted at rest using AES-256-GCM. We never store them in plain text, ensuring complete privacy.
                            </p>
                        </motion.div>

                        {/* Feature 3 */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="glass-card flex flex-col items-center text-center space-y-4"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-2">
                                <FileCheck className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-semibold">Public Verification</h3>
                            <p className="text-dark-400 text-sm">
                                Anyone can verify the authenticity of a document instantly without needing an account, leveraging the embedded signature metrics.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Workflow Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="glass-card p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-aegis-primary/10 rounded-full blur-3xl"></div>

                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-bold mb-6">Seamless Workflow</h2>
                                <ul className="space-y-6">
                                    {[
                                        { title: 'Upload PDF', desc: 'Securely upload your document over HTTPS.' },
                                        { title: 'Hash & Sign', desc: 'Document is hashed (SHA-256) and signed with your decrypted key.' },
                                        { title: 'Receive Metadata', desc: 'Signature is seamlessly injected into the PDF metadata.' }
                                    ].map((step, i) => (
                                        <li key={i} className="flex gap-4">
                                            <div className="flex-shrink-0 mt-1">
                                                <CheckCircle className="w-5 h-5 text-aegis-success" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{step.title}</h4>
                                                <p className="text-sm text-dark-400">{step.desc}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="relative h-64 glass flex items-center justify-center border-dashed border-2 border-white/20">
                                <div className="text-center p-6">
                                    <Zap className="w-12 h-12 text-aegis-accent mx-auto mb-4 animate-pulse-glow" />
                                    <h3 className="font-medium text-lg">Lighting Fast Execution</h3>
                                    <p className="text-sm text-dark-400 mt-2">Signaments processed in milliseconds.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
