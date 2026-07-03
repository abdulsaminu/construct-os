/** @type {import('tailwindcss').Config} */
export default {
  content: [ "./index.html", "./src/**/*.{js,ts,jsx,tsx}" ],
  theme: {
    extend: {
      /* ===== Color Tokens — Dark Sidebar + Light Content Split ===== */
      colors: {
        /* Backgrounds */
        bg: '#F8FAFC',
        surface: '#FFFFFF',
        elevated: '#F1F5F9',
        'sidebar-bg': '#172554',
        'sidebar-hover': 'rgba(255, 255, 255, 0.06)',
        'sidebar-active': 'rgba(255, 255, 255, 0.10)',
        'sidebar-border': 'rgba(255, 255, 255, 0.08)',

        /* Brand */
        primary: '#356DFF',
        'primary-hover': '#2554CC',
        'primary-glow': 'rgba(53, 109, 255, 0.25)',
        cyan: '#22D3EE',
        gold: '#FACC15',

        /* Semantic */
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
        info: '#2563EB',

        /* Text — light content area */
        'text-main': '#0F172A',
        'text-muted': '#64748B',
        'text-dim': '#94A3B8',

        /* Text — dark sidebar */
        'sidebar-text': '#E2E8F0',
        'sidebar-text-muted': '#94A3B8',
        'sidebar-text-dim': '#64748B',
        'sidebar-text-active': '#FFFFFF',

        /* Borders — light content */
        'border-main': '#E2E8F0',
      },

      /* ===== Border Radius Tokens ===== */
      borderRadius: {
        btn: '6px',
        card: '12px',
        dialog: '16px',
        input: '8px',
        badge: '999px',
        '6': '6px',
        '8': '8px',
        '12': '12px',
        '16': '16px',
        '24': '24px',
      },

      /* ===== Typography Tokens ===== */
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-md': ['3rem', { lineHeight: '1.08', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display': ['2.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        /* Page title — 36px semibold for visual hierarchy */
        'page-title': ['2.25rem', { lineHeight: '1.2', fontWeight: '600' }],
        /* Section heading — 22px semibold */
        'h1': ['1.375rem', { lineHeight: '1.4', fontWeight: '600' }],
        'h2': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'h3': ['1.125rem', { lineHeight: '1.5', fontWeight: '500' }],
        'title': ['1.125rem', { lineHeight: '1.5', fontWeight: '500' }],
        'body-lg': ['1rem', { lineHeight: '1.6', fontWeight: '500' }],
        'body': ['0.9375rem', { lineHeight: '1.6', fontWeight: '400' }],
        /* Description text — 14px regular */
        'small': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        /* Card labels — 12px medium */
        'label': ['0.75rem', { lineHeight: '1.5', fontWeight: '500' }],
        'caption': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],
        'micro': ['0.625rem', { lineHeight: '1.5', fontWeight: '500' }],
      },

      /* ===== Spacing Tokens ===== */
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
      },

      /* ===== Shadow Tokens — Light theme ===== */
      boxShadow: {
        surface: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        raised: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
        floating: '0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
        overlay: '0 24px 60px rgba(0, 0, 0, 0.18), 0 8px 20px rgba(0, 0, 0, 0.1)',
        'level-1': '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'level-2': '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'level-3': '0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
        soft: '0 1px 2px rgba(0, 0, 0, 0.05)',
      },

      /* ===== Animation Duration Tokens ===== */
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '350ms',
      },

      /* ===== Easing Tokens ===== */
      transitionTimingFunction: {
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        panel: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },

      /* ===== Keyframes ===== */
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out': {
          from: { opacity: '1', transform: 'translateY(0)' },
          to: { opacity: '0', transform: 'translateY(8px)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.98)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-out-right': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(100%)' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'toast-out': {
          from: { opacity: '1', transform: 'translateX(0)' },
          to: { opacity: '0', transform: 'translateX(100%)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'progress-fill': {
          from: { width: '0%' },
          to: { width: 'var(--progress-width)' },
        },
        'chevron-rotate': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(180deg)' },
        },
      },

      /* ===== Animation Shortcuts ===== */
      animation: {
        'fade-in': 'fade-in 250ms ease-out',
        'fade-out': 'fade-out 250ms ease-in',
        'scale-in': 'scale-in 250ms ease-out',
        'slide-in-right': 'slide-in-right 350ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        'slide-out-right': 'slide-out-right 250ms ease-in',
        'toast-in': 'toast-in 350ms ease-out',
        'toast-out': 'toast-out 250ms ease-in forwards',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'progress': 'progress-fill 350ms ease-out forwards',
      },
    },
  },
  plugins: [],
};