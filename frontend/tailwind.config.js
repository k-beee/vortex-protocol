/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        heading: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        vortex: {
          bg: '#ffffff',
          deep: '#f7f5fc',
          card: '#ffffff',
          muted: '#f0edf8',
          accent: '#7c3aed',
          purple: '#b364ff',
          dim: '#f3e8ff',
          border: '#ddd8f0',
          dark: '#0e0b16',
          darkcard: '#161224',
          bull: '#10b981',
          bear: '#ef4444',
        }
      },
      boxShadow: {
        cyber: '0 0 12px rgba(124, 58, 237, 0.25)',
        terminal: '0 4px 20px rgba(0, 0, 0, 0.08)',
        neon: '0 0 15px rgba(179, 100, 255, 0.4)',
      },
      animation: {
        'pulse-accent': 'pulse-accent 2s ease-in-out infinite',
        'blink': 'blink 1s step-end infinite',
        'glitch': 'glitch 0.3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-accent': {
          '0%, 100%': { boxShadow: '0 0 4px rgba(179, 100, 255, 0.3)' },
          '50%': { boxShadow: '0 0 12px rgba(179, 100, 255, 0.7)' },
        },
        'blink': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        }
      }
    },
  },
  plugins: [],
}
