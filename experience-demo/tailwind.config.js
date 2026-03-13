/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      colors: {
        glass: {
          bg: 'rgba(15, 15, 25, 0.6)',
          card: 'rgba(20, 20, 35, 0.5)',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-active': 'rgba(255, 255, 255, 0.15)',
        },
        op: {
          remember: '#22c55e',
          recall: '#3b82f6',
          reflect: '#f59e0b',
          revise: '#ef4444',
          forget: '#6b7280',
          prime: '#8b5cf6',
        },
        insight: '#ffc857',
        memory: '#06b6d4',
      },
      backdropBlur: {
        glass: '20px',
        card: '12px',
      },
      animation: {
        'mesh-drift': 'meshDrift 60s ease-in-out infinite',
        'glow-pulse': 'glowPulse 1s ease-in-out',
      },
      keyframes: {
        meshDrift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        glowPulse: {
          '0%': { opacity: '0.3' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
};
