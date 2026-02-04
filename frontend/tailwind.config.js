/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Custom dark theme colors
                dark: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#020617',
                },
                // Accent colors
                aegis: {
                    primary: '#6366f1',    // Indigo
                    secondary: '#8b5cf6',   // Violet
                    accent: '#06b6d4',      // Cyan
                    success: '#10b981',     // Emerald
                    warning: '#f59e0b',     // Amber
                    danger: '#ef4444',      // Red
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            backdropBlur: {
                xs: '2px',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'scan': 'scan 2s ease-in-out infinite',
                'glitch': 'glitch 0.3s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
                    '100%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.6)' },
                },
                scan: {
                    '0%, 100%': { transform: 'translateY(-100%)' },
                    '50%': { transform: 'translateY(100%)' },
                },
                glitch: {
                    '0%, 100%': { transform: 'translate(0)', filter: 'hue-rotate(0deg)' },
                    '20%': { transform: 'translate(-2px, 2px)', filter: 'hue-rotate(90deg)' },
                    '40%': { transform: 'translate(-2px, -2px)', filter: 'hue-rotate(180deg)' },
                    '60%': { transform: 'translate(2px, 2px)', filter: 'hue-rotate(270deg)' },
                    '80%': { transform: 'translate(2px, -2px)', filter: 'hue-rotate(360deg)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            }
        },
    },
    plugins: [],
}
