/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./tabs/**/*.{js,jsx,ts,tsx}",
    "./*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {

    // ADD COLOR PALETTE HERE
      colors:{
        primary: '#030014',
        accent: '#AB8BFF'
      }
    },
  },
  plugins: [],
}