/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vault: {
          bg: '#0a0a0f',
          surface: '#12121a',
          card: '#1a1a26',
          border: '#2a2a3e',
          amber: '#f59e0b',
          gold: '#fbbf24',
          'gold-light': '#fde68a',
          green: '#10b981',
          red: '#ef4444',
          muted: '#6b7280',
          text: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-amber': 'pulse-amber 2s ease-in-out infinite',
        'glow-green': 'glow-green 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'lock-bounce': 'lock-bounce 0.5s ease-in-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
      },
      keyframes: {
        'pulse-amber': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245, 158, 11, 0)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(245, 158, 11, 0.3)' },
        },
        'glow-green': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(16, 185, 129, 0.3)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'lock-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #f59e0b, #fbbf24, #f59e0b)',
        'card-gradient': 'linear-gradient(145deg, #1a1a26, #12121a)',
      }
    },
  },
  plugins: [],
}
