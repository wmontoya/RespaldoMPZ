import type { Config } from "tailwindcss";
const { nextui } = require('@nextui-org/theme');
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark_primary: {
          100: '#4A6FA1',
          200: '#3D5D8F',
          300: '#304B7D',
          400: '#23396B',
          500: '#072455', // Color base
          600: '#061E48',
          700: '#05173B',
          800: '#040F2E',
          900: '#030821',
        },
        primary: {
          100: '#B3D4FC',
          200: '#99C9FC',
          300: '#7FBDFC',
          400: '#66B2FC',
          500: '#4DA6FC', // Un poco más claro que el color base
          600: '#329BFC',
          700: '#1282FB', // Color base
          800: '#0F74DA',
        }
      }
    },
  },
  darkMode: 'class',
  plugins: [
    nextui()
  ],
};
export default config;
