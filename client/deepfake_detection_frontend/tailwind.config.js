import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        press_start_2p: ["'Press Start 2P'", "serif"], // Regular style
        oxanium: ["Oxanium", "serif"], // Variable weights
      },
      fontWeight: {
        oxanium: {
          200: "200",
          300: "300",
          400: "400",
          500: "500",
          600: "600",
          700: "700",
          800: "800",
        },
      },
      fontOpticalSizing: {
        auto: "auto", // Enable font optical sizing
      },
      backgroundImage: {
        "custom-gradient":
          "linear-gradient(103deg, rgba(255, 255, 255, 0.052) -9.46%, rgba(255, 255, 255, 0.26) 110.33%)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
