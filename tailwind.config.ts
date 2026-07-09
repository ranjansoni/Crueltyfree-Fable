import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0faf4",
          100: "#dbf3e4",
          200: "#bae6cd",
          300: "#8bd3ac",
          400: "#57b886",
          500: "#349d68",
          600: "#247e53",
          700: "#1e6544",
          800: "#1b5038",
          900: "#17422f",
        },
      },
    },
  },
  plugins: [],
};
export default config;
