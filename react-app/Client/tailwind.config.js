/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        kanit: ['"Kanit"', "sans-serif"],
        rubikMonoOne: ['"Rubik Mono One"', "sans-serif"],
      },
    },
    colors: {
      bg: "#F5F5F5",
      black: "#212121",
      darkGray: "#757575",

      emp: {
        primary: "#2196F3",
        secondary: "#BBDEFB",
        accent: "#1976D2",
      },

      admin: {
        primary: "#4CAF50",
        secondary: "#C8E6C9",
        accent: "#388E3C",
      },

      sa: {
        primary: "#FFA143",
        accent: "#FF6320",
        secondary: "#FFE1B5",
      },

      danger: "#F44336",
      white: "#FFFFFF",
    },
  },
  plugins: [],
};
