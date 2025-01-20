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
      background: "#F6F4F5",
      primary: "#14121F",
      white: "#FFFF",
      dark_blur: "#04132A",
      employee: "#0179FE",
      admin: "#6A5DAD",
      "admin-pink": "#FD84A9",
      "yellow-orange": "#FFA500",
      orange: "#FF7600",
    },
  },
  plugins: [],
};
