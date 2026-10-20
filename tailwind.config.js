import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['DM Serif Display', 'Georgia', 'serif']
      }
    }
  },
  daisyui: {
    themes: ['nord'],
    darkTheme: 'nord'
  },
  plugins: [daisyui]
};
