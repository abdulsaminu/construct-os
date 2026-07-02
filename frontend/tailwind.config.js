/** @type {import('tailwindcss').Config} */
export default {
  content: [ "./index.html", "./src/**/*.{js,ts,jsx,tsx}" ],
  theme: {
    extend: {
      colors: {
        bg: '#0B1220',
        surface: '#111827',
        elevated: '#1A2438',
        primary: '#356DFF',
        'primary-hover': '#2554CC',
        success: '#22C55E',
        warning: '#FACC15',
        danger: '#EF4444',
        'text-main': '#F9FAFB',
        'text-muted': '#9CA3AF',
        'text-dim': '#6B7280',
        'border-main': '#1F2937',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['3rem', { lineHeight: '1.1' }],
        'h1': ['2.25rem', { lineHeight: '1.2' }],
        'h2': ['1.75rem', { lineHeight: '1.3' }],
        'h3': ['1.375rem', { lineHeight: '1.4' }],
        'body': ['1rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.5' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
