import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Barbershop dark theme with gold accent
        primary: {
          50: '#f9f6f2',
          100: '#f3ede5',
          200: '#e7dbcb',
          300: '#dbc9b1',
          400: '#cfb797',
          500: '#c8a259',
          600: '#b89450',
          700: '#a88447',
          800: '#8a6b3a',
          900: '#6c542d',
        },
        dark: {
          50: '#f8f8f8',
          100: '#f1f1f1',
          200: '#e3e3e3',
          300: '#d5d5d5',
          400: '#b8b8b8',
          500: '#9a9a9a',
          600: '#7c7c7c',
          700: '#5e5e5e',
          800: '#404040',
          900: '#1a1a1a',
        },
        accent: '#c8a259',
        gold: '#c8a259',
      },
      backgroundColor: {
        base: '#1a1a1a',
        secondary: '#2a2a2a',
      },
      textColor: {
        base: '#f1f1f1',
        secondary: '#b8b8b8',
      },
    },
  },
  plugins: [],
};

export default config;
