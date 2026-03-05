import { motion } from 'framer-motion';
import { Shield, Lock, FileKey2, CheckCircle2, Key, FileCheck } from 'lucide-react';

export default function Docs() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">
                        AegisSign <span className="heading-gradient">Documentation</span>
                    </h1>
                    <p className="text-xl text-dark-300">
                        Understanding the Zero-Trust Architecture
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Section 1: Overview */}
                    <section className="glass-card">
                        <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
                            <Shield className="w-6 h-6 text-aegis-primary" />
                            <h2 className="text-2xl font-bold">Platform Overview</h2>
                        </div>
                        <p className="text-dark-300 leading-relaxed mb-4">
                            AegisSign is a production-ready digital signature platform leveraging Ed25519 elliptic curve cryptography.
                            It is built on a "Zero-Trust" security model. This means the server operates with zero knowledge of your private cryptographic keys in plain text.
                        </p>
                        <ul className="space-y-3 mt-4 text-dark-300">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-aegis-success shrink-0 mt-0.5" />
                                <span><strong>Key Encryption:</strong> AES-256-GCM</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-aegis-success shrink-0 mt-0.5" />
                                <span><strong>Key Derivation:</strong> PBKDF2 (100,000 iterations)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-aegis-success shrink-0 mt-0.5" />
                                <span><strong>Signatures & Hashing:</strong> Ed25519 & SHA-256</span>
                            </li>
                        </ul>
                    </section>

                    {/* Section 2: Zero-Knowledge Registration */}
                    <section className="glass-card">
                        <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
                            <Key className="w-6 h-6 text-indigo-400" />
                            <h2 className="text-2xl font-bold">The Registration Flow</h2>
                        </div>
                        <p className="text-dark-300 leading-relaxed mb-6">
                            When you register an account, AegisSign immediately ensures your keys are protected.
                        </p>
                        <ol className="space-y-4 text-dark-300 list-decimal list-inside ml-2">
                            <li>Your plaintext password is sent securely over HTTPS.</li>
                            <li>The server uses <strong>PBKDF2</strong> to derive a <em>Data Encryption Key (DEK)</em>.</li>
                            <li>A new <strong>Ed25519 Keypair</strong> (Public & Private) is generated.</li>
                            <li>The Private Key is encrypted using <strong>AES-256-GCM</strong> with the derived DEK.</li>
                            <li>The encrypted Private Key, Public Key, Initialization Vector (IV), and salt are stored in MongoDB.</li>
                        </ol>
                        <div className="mt-6 p-4 bg-dark-900 rounded-xl border border-white/5">
                            <p className="text-sm font-mono text-aegis-accent text-center">
                                Password → PBKDF2 → DEK → Encrypt(PrivateKey) → Database
                            </p>
                        </div>
                    </section>

                    {/* Section 3: Signing & Verification */}
                    <section className="glass-card">
                        <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
                            <FileCheck className="w-6 h-6 text-emerald-400" />
                            <h2 className="text-2xl font-bold">Signing & Verification</h2>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                    <Lock className="w-5 h-5" /> 1. Signing Process
                                </h3>
                                <p className="text-dark-300 leading-relaxed mb-3">
                                    When you upload a PDF, the file is hashed using <strong>SHA-256</strong>.
                                    Your stored password derives the DEK to temporarily decrypt your Private Key in memory.
                                    The hash is signed via Ed25519. The signature and your public key are injected strictly into the PDF's metadata.
                                    The decrypted key is immediately erased from server memory.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                    <FileKey2 className="w-5 h-5" /> 2. Verification Process
                                </h3>
                                <p className="text-dark-300 leading-relaxed">
                                    Verification requires no account. The uploaded PDF has its metadata stripped to recreate the exact "clean" file that was originally hashed.
                                    This "clean" file is hashed again via SHA-256. The server then uses the embedded Public Key and Signature to verify the hash authenticity.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </motion.div>
        </div>
    );
}
