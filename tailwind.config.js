/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,ts,tsx}", "./components/**/*.{js,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
      extend: {
        colors: {
          // Primary colors
          'primary': {
            DEFAULT: '#2C3E50', // Deep Blue
            'light': '#3B4F63',
            'dark': '#1E2B3C',
          },
          'secondary': {
            DEFAULT: '#4CAF50', // Mint Green
            'light': '#6ABD6E',
            'dark': '#3E8E41',
          },
          
          // Secondary colors
          'background': '#F5F7FA', // Light Gray
          'text': '#36454F',       // Charcoal
          'accent': '#3498DB',     // Accent Blue
          
          // Functional colors
          'success': '#27AE60',    // Success Green
          'warning': '#F39C12',    // Warning Amber
          'error': '#E74C3C',      // Error Red
        },
      },
    },
    plugins: [],
  }
