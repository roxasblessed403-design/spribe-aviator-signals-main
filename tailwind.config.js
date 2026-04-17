/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#050810',
          card: '#0a0f1e',
          border: '#0d1a2e',
          cyan: '#00e5ff',
          blue: '#0066ff',
          purple: '#8b00ff',
          pink: '#ff006e',
          green: '#00ff88',
          yellow: '#ffd700',
          red: '#ff2244',
          muted: '#1a2440',
        }
      },
      fontFamily: {
        display: ['var(--font-orbitron)', 'monospace'],
        body: ['var(--font-rajdhani)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      animation: {
        'pulse-cyan': 'pulse-cyan 2s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'flicker': 'flicker 4s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-cyan': {
          '0%, 100%': { boxShadow: '0 0 10px #00e5ff40' },
          '50%': { boxShadow: '0 0 30px #00e5ff80, 0 0 60px #00e5ff40' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
          '75%': { opacity: '0.95' },
        },
        'glow': {
          'from': { textShadow: '0 0 10px #00e5ff' },
          'to': { textShadow: '0 0 20px #00e5ff, 0 0 40px #0066ff' },
        }
      },
      backgroundImage: {
        'grid-cyber': `linear-gradient(rgba(0, 229, 255, 0.03) 1px, transparent 1px),
                       linear-gradient(90deg, rgba(0, 229, 255, 0.03) 1px, transparent 1px)`,
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
