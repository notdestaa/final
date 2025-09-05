/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4B9CD3", // Carolina Blue
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#0B0B0C",
          foreground: "#ffffff",
        },
        card: "#0c111b",
      },
    },
  },
  plugins: [],
}
