import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#fff7ed",
        berry: "#ec4899",
        mint: "#8ddfb5",
        ink: "#342b38",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(52, 43, 56, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
