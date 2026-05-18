/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#52C6F5', // Warna utama (Cyan/Blue)
        accent: '#FF9452',  // Warna aksen (Orange)
        dark: '#1A1A1D',    // Background gelap
      }
    },
  },
  plugins: [],
}