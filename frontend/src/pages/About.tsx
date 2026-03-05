import { motion } from 'framer-motion';
import { Shield, Code, Database, Lock, GraduationCap } from 'lucide-react';

export default function About() {
    const team = [
        {
            name: "Devansh Behl",
            role: "Encryption",
            icon: <Lock className="w-6 h-6 text-indigo-400" />,
            color: "from-indigo-500/20 to-purple-500/20"
        },
        {
            name: "Lay Gupta",
            role: "Developer",
            icon: <Code className="w-6 h-6 text-emerald-400" />,
            color: "from-emerald-500/20 to-teal-500/20"
        },
        {
            name: "Madhur Tiwari",
            role: "Databases & Datasets",
            icon: <Database className="w-6 h-6 text-blue-400" />,
            color: "from-blue-500/20 to-cyan-500/20"
        }
    ];

    return (
        <div className="flex flex-col min-h-[80vh] py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center justify-center p-3 mb-6 rounded-full bg-aegis-primary/10 border border-aegis-primary/20">
                        <Shield className="w-8 h-8 text-aegis-primary" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">
                        Meet the <span className="heading-gradient">Team</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-dark-300">
                        The minds behind AegisSign's Zero-Trust architecture.
                    </p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5"
                    >
                        <GraduationCap className="w-5 h-5 text-aegis-accent" />
                        <span className="text-sm font-medium text-dark-200">Pre-Final Year Students @ VIT Chennai</span>
                    </motion.div>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {team.map((member, index) => (
                        <motion.div
                            key={member.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                            whileHover={{ y: -5 }}
                            className="glass-card flex flex-col items-center text-center p-8 relative overflow-hidden"
                        >
                            {/* Decorative background glow */}
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${member.color} blur-3xl rounded-full -mr-16 -mt-16 opacity-50`} />

                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center mb-6 relative z-10 border border-white/5 shadow-lg`}>
                                {member.icon}
                            </div>

                            <h3 className="text-2xl font-bold mb-2 relative z-10">{member.name}</h3>
                            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-dark-300 font-medium relative z-10">
                                {member.role}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
