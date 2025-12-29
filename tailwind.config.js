/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Marple Palette - Warm & Eye-catching
        primary: {
          50: '#fef1f4',
          100: '#fde4ea',
          200: '#fcccd8',
          300: '#f9a3b8',
          400: '#f46d8c',
          500: '#CA2851', // Main primary
          600: '#b82349',
          700: '#9a1d3d',
          800: '#801a35',
          900: '#6d1a31',
          950: '#3d0917',
        },
        // Coral - Secondary
        coral: {
          50: '#fff1f1',
          100: '#ffe1e1',
          200: '#ffc9c8',
          300: '#ffa3a2',
          400: '#FF6766', // Main coral
          500: '#f83b3a',
          600: '#e51d1c',
          700: '#c11514',
          800: '#a01514',
          900: '#841918',
          950: '#480707',
        },
        // Peach - Accent
        peach: {
          50: '#fff8f1',
          100: '#ffeedd',
          200: '#ffdcbb',
          300: '#FFB173', // Main peach
          400: '#ff9a4d',
          500: '#fe7c24',
          600: '#ef6110',
          700: '#c64a10',
          800: '#9d3c15',
          900: '#7e3314',
          950: '#441708',
        },
        // Cream - Highlight
        cream: {
          50: '#fffcf5',
          100: '#FFE3B3', // Main cream
          200: '#ffd699',
          300: '#ffc266',
          400: '#ffab33',
          500: '#ff9500',
          600: '#e67a00',
          700: '#bf5f00',
          800: '#994a00',
          900: '#7a3d00',
          950: '#451f00',
        },
        // Success - Soft green
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        // Warning - Using peach tones
        warning: {
          50: '#fff8f1',
          100: '#ffeedd',
          400: '#FFB173',
          500: '#ff9a4d',
          600: '#ef6110',
        },
        // Danger - Using coral/primary tones
        danger: {
          50: '#fff1f1',
          100: '#ffe1e1',
          400: '#FF6766',
          500: '#CA2851',
          600: '#b82349',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
