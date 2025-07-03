/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#f3f4f6',
        active: '#10b981',
        draft: '#f59e0b',
        archived: '#ef4444'
      }
    },
  },
  darkMode: 'class',
  plugins: [],
}