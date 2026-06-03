/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Consolas', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#eef6ff',
          100: '#daeaff',
          200: '#bdd8ff',
          300: '#90bbff',
          400: '#5c93f8',
          500: '#3a6ef0',
          600: '#2550e4',
          700: '#1d3ecf',
          800: '#1e35a8',
          900: '#1e3185',
          950: '#162054',
        },
        accent: {
          purple: '#6d4fc2',
          pink:   '#c2395d',
          amber:  '#c27a22',
          emerald:'#1a8c5b',
          cyan:   '#1a7d99',
        },
        dark: {
          bg:      '#111318',
          card:    '#181c24',
          border:  '#252c3b',
          surface: '#1d2230',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'shimmer':    'shimmer 1.6s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
      boxShadow: {
        'card':      '0 1px 4px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.03)',
        'card-hover':'0 4px 16px rgba(0,0,0,0.5)',
        'ring':      '0 0 0 3px rgba(58,110,240,0.25)',
        'inset':     'inset 0 1px 0 rgba(255,255,255,0.04)',
      },
      borderRadius: {
        'sm':  '4px',
        DEFAULT:'6px',
        'md':  '8px',
        'lg':  '10px',
        'xl':  '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        chatbotedu: {
          primary:    '#3a6ef0',
          secondary:  '#6d4fc2',
          accent:     '#1a8c5b',
          neutral:    '#252c3b',
          'base-100': '#111318',
          'base-200': '#181c24',
          'base-300': '#1d2230',
          info:       '#1a7d99',
          success:    '#1a8c5b',
          warning:    '#c27a22',
          error:      '#c2395d',
        },
      },
    ],
    darkTheme: 'chatbotedu',
  },
};
