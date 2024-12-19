/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}","./src/components/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        montserrat: [ "Montserrat", "sans-serif"],
        playfair_display: ["Playfair Display", "serif"],
      },
      backgroundImage: {
        'custom-gradient': "linear-gradient(103deg, rgba(255, 255, 255, 0.052) -9.46%, rgba(255, 255, 255, 0.26) 110.33%)",
      }
    },
  },
  plugins: [],
}

