/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        primary: "#59290C",
        "primary-light": "#BF7C41",
        "primary-dark": "#26130F",
        secondary: "#8C8474",
        "secondary-light": "#D9D4CC",
      },
    },
  },
  plugins: [],
};
