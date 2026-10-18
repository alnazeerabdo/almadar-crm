/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', 'system-ui', 'Segoe UI', 'Tahoma', 'Arial', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#16A34A',
          dark: '#15803D',
          light: '#DCFCE7',
          pale: '#F0FDF4',
        },
        ink: '#111827',
        slate2: '#374151',
        mut: '#6B7280',
        bgmain: '#F8FAFC',
        line: '#E5E7EB',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16,24,40,.05), 0 1px 3px rgba(16,24,40,.07)',
        pop: '0 12px 32px -12px rgba(16,24,40,.18)',
      },
    },
  },
  plugins: [],
}
