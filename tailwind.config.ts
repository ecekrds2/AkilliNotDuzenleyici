import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        dark: {
          50:  '#f8f8ff',
          900: '#0a0a0f',
          800: '#111118',
          700: '#1a1a24',
          600: '#22223a',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease forwards',
        'pulse-glow': 'pulse-glow 2s ease infinite',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99,102,241,0.3)' },
          '50%':       { boxShadow: '0 0 40px rgba(99,102,241,0.6)' },
        },
      },
    },
  },
  plugins: [],
}
export default config