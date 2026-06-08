/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        deep: {
          950: '#030712',
          900: '#050816',
          850: '#0B1026',
        },
        neon: {
          cyan: '#00E5FF',
          blue: '#38BDF8',
          purple: '#7C3AED',
          violet: '#A855F7',
        },
      },
      boxShadow: {
        glow: '0 0 38px rgba(0, 229, 255, 0.35)',
        'glow-purple': '0 0 42px rgba(168, 85, 247, 0.35)',
        glass: '0 24px 80px rgba(0, 0, 0, 0.45)',
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
