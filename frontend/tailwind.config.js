/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        autoqc: {
          bg: '#F5F9FE',
          card: '#FFFFFF',
          border: '#E2E8F0',
          blue: '#1685F8',
          'blue-light': '#EAF2FF',
          navy: '#18345F',
          subtext: '#64748B',
          dark: '#0F172A',
          green: '#10B981',
          'green-light': '#ECFDF5',
          amber: '#F59E0B',
          'amber-light': '#FFFBEB',
          red: '#EF4444',
          'red-light': '#FEF2F2'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace']
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 4px 12px rgba(22, 133, 248, 0.08)'
      }
    },
  },
  plugins: [],
}
