/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Plus Jakarta Sans", "sans-serif"]
      },
      colors: {
        ink: "#0f172a",
        mist: "#eef2ff",
        ocean: "#2563eb",
        wave: "#22d3ee",
        rose: "#fb7185"
      }
    }
  },
  plugins: []
};
