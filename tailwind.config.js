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
        brand: {
          bg: '#F7F6F3',
          surface: '#FFFFFF',
          border: '#E2E1DC',
          text: '#1C1C1A',
          muted: '#6B6B67',
          accent: '#2A6349',
          'accent-light': '#E8F2ED',
          danger: '#C0392B',
          warning: '#D4821A',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}
