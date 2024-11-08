import { animations, keyframes } from "framer-motion";

/** @type {import('tailwindcss').Config} */
const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");
 
module.exports = {
  content: ['./src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/ui/**/*.{js,ts,jsx,tsx}',
    './src/app/user-main/**/*.{js,ts,jsx,tsx}',],
  darkMode: "class",
  theme: {
    extend: {
      animation: {
        shimmer: "shimmer 2s linear infinite",
        aurora: "aurora 60s linear infinite",
      },
      keyframes: {
        shimmer: {
          from: {
            backgroundPosition: "0 0",
          },
          to: {
            backgroundPosition: "-200% 0",
          },
        },
        aurora: {
          from: {
            backgroundPosition: "50% 50%, 50% 50%",
          },
          to: {
            backgroundPosition: "350% 50%, 350% 50%",
          },
        },
      },
      colors: {
        Primary: "#3c4253",
        Secondary: "#C19E7B",
        text: "#43475E",
        test: "#A5A193",
      },
    }
  },
  plugins: [addVariablesForColors],
};
function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );
 
  addBase({
    ":root": newVars,
  });
}
