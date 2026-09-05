/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette directly extracted from user's Freeze color image
        freeze: {
          ice: '#E3F2FD',       // Lightest frost-white blue (labeled in image)
          sky: '#90CAF9',       // Soft cold frost blue (2nd bar)
          arctic: '#2196F3',    // Vibrant electric arctic blue (3rd bar)
          deep: '#0D47A1',      // Deep royal ocean blue (4th bar)
          abyss: '#081426',     // Ultra-deep frosted dark navy (cards & surfaces)
          dark: '#030812',      // Deep cryo obsidian background
          surface: '#0c1d38',   // Raised element surface
          border: 'rgba(144, 202, 249, 0.18)',
          'border-highlight': 'rgba(144, 202, 249, 0.45)',
          glow: 'rgba(33, 150, 243, 0.25)',
        },
        // Backward compatibility mappings
        vault: {
          bg: '#030812',
          surface: '#081426',
          card: '#0c1d38',
          border: 'rgba(144, 202, 249, 0.18)',
          amber: '#2196F3',
          gold: '#90CAF9',
          green: '#00E676',
          muted: '#8097b8',
          text: '#E3F2FD',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'frost-glow': 'frost-glow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
      },
      keyframes: {
        'frost-glow': {
          '0%, 100%': { boxShadow: '0 0 15px 1px rgba(33, 150, 243, 0.15)' },
          '50%': { boxShadow: '0 0 30px 4px rgba(144, 202, 249, 0.35)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
