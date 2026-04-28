const { hairlineWidth } = require("nativewind/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      borderWidth: {
        hairline: hairlineWidth(),
      },
      fontFamily: {
        sans: ["Inter_400Regular"],
        "sans-bold": ["Inter_700Bold"],
        hebrew: ["SBLHebrew"],
        greek: ["SBLGreek"],
      },
      colors: {
        // Paleta do Logós
        primary: {
          50: "#f0f4ff",
          100: "#e0eaff",
          500: "#4F6AF5",
          600: "#3A57E8",
          900: "#1a2b6b",
        },
        sepia: {
          50: "#fdf8f0",
          100: "#faf0dc",
          900: "#5c4a1e",
        },
      },
    },
  },
};
