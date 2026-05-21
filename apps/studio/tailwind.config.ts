import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#08090c',
        panel: '#11131a',
        line: '#2a2f3d'
      }
    }
  },
  plugins: []
};

export default config;
