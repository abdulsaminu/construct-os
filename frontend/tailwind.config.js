/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
      // Dedicated numeral family for financial figures — distinct grotesk-mono
      // numerals are a deliberate signal of engineering precision (same pattern
      // Stripe/Mercury/Linear use for monetary values and metrics).
      mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
    },
    extend: {
      colors: {
        bg: '#F7F9FC',
        surface: '#FFFFFF',
        elevated: '#F1F5F9',
        'sidebar-bg': '#172554',
        'sidebar-hover': 'rgba(255, 255, 255, 0.06)',
        'sidebar-active': 'rgba(255, 255, 255, 0.10)',
        'sidebar-border': 'rgba(255, 255, 255, 0.08)',
        primary: '#2563EB',
        'primary-hover': '#1D4ED8',
        'primary-glow': 'rgba(37, 99, 235, 0.15)',
        cyan: '#22D3EE',
        gold: '#FACC15',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#DC2626',
        info: '#2563EB',
        'text-main': '#0F172A',
        'text-muted': '#64748B',
        'text-dim': '#94A3B8',
        'sidebar-text': '#E2E8F0',
        'sidebar-text-muted': '#94A3B8',
        'sidebar-text-dim': '#64748B',
        'sidebar-text-active': '#FFFFFF',
        'border-main': '#E5E7EB',
      },
      spacing: {
        '1': '4px', '2': '8px', '3': '12px', '4': '16px',
        '6': '24px', '8': '32px', '40': '40px', '12': '48px',
        '16': '64px', '18': '4.5rem', '88': '22rem', '112': '28rem',
        // Card/table system spacing — named tokens so usage is self-documenting
        // wherever they appear, rather than relying on memorized numeric scale.
        'card-padding': '24px',      // matches existing p-6 convention used across cards
        'card-gap': '24px',          // matches existing gap-6 grid convention
        'table-cell-y': '16px',      // matches existing py-4 table row convention
        'table-cell-x': '16px',
        'section-gap': '32px',       // matches existing space-y-8/gap-8 section rhythm
      },
      borderRadius: {
        btn: '12px', card: '16px', dialog: '16px', input: '12px',
        badge: '9999px', '6': '6px', '8': '8px', '12': '12px',
        '16': '16px', '24': '24px',
      },
      boxShadow: {
        surface: '0 1px 2px rgba(15, 23, 42, 0.03)',
        raised: '0 4px 12px rgba(15, 23, 42, 0.06)',
        floating: '0 12px 32px rgba(15, 23, 42, 0.08)',
        overlay: '0 20px 48px rgba(15, 23, 42, 0.12)',
        'level-1': '0 1px 2px rgba(15, 23, 42, 0.03)',
        'level-2': '0 4px 12px rgba(15, 23, 42, 0.06)',
        'level-3': '0 12px 32px rgba(15, 23, 42, 0.08)',
        soft: '0 1px 2px rgba(15, 23, 42, 0.03)',
      },
      fontSize: {
        // --- Page-level display ---
        'display-lg': ['3rem', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display': ['2.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['1.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],

        // --- KPI / metric emphasis (new) ---
        // Used specifically for the primary number inside a MetricCard or any
        // "this is the headline figure" moment. Distinct from page display type
        // so a dashboard's key numbers can out-rank page titles visually, which
        // is what a finance-executive-facing dashboard needs at first glance.
        'metric-lg': ['2.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
        'metric': ['1.875rem', { lineHeight: '1.1', letterSpacing: '-0.015em', fontWeight: '700' }],

        // --- Headings ---
        'page-title': ['1.75rem', { lineHeight: '1.1', fontWeight: '700' }],
        'h1': ['1.375rem', { lineHeight: '1.4', fontWeight: '600' }],
        'h2': ['1.75rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['1.125rem', { lineHeight: '1.5', fontWeight: '500' }],
        'title': ['1.125rem', { lineHeight: '1.5', fontWeight: '500' }],

        // --- Body ---
        'body-lg': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'small': ['0.75rem', { lineHeight: '1.5', fontWeight: '500' }],

        // --- Labels / captions / overline ---
        // FIXED: 'label' was previously 1.125rem/600 (18px bold) — nearly as
        // prominent as a metric value itself, which inverted the intended
        // hierarchy anywhere it was used as a small overline caption (it was,
        // in both MetricCard's KPI title and Table's column headers). Now a
        // proper small, quiet, uppercase-tracked overline treatment.
        'label': ['0.6875rem', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '0.04em' }],
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '700' }],
        'micro': ['0.6875rem', { lineHeight: '1.4', fontWeight: '500' }],
      },
      transitionDuration: { fast: '150ms', normal: '250ms', slow: '350ms' },
      transitionTimingFunction: {
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        panel: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'fade-out': { from: { opacity: '1', transform: 'translateY(0)' }, to: { opacity: '0', transform: 'translateY(4px)' } },
        'scale-in': { from: { opacity: '0', transform: 'scale(0.98)' }, to: { opacity: '1', transform: 'scale(1)' } },
        'slide-in-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'slide-out-right': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(100%)' } },
        'toast-in': { from: { opacity: '0', transform: 'translateX(100%)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        'toast-out': { from: { opacity: '1', transform: 'translateX(0)' }, to: { opacity: '0', transform: 'translateX(100%)' } },
        'shimmer': { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'progress-fill': { from: { width: '0%' }, to: { width: 'var(--progress-width)' } },
        'chevron-rotate': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(180deg)' } },
      },
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
