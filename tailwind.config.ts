import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#4E626A",
        sky: "#68AAC6",
        mist: "#899FAF",
        fog: "#A7BCC9",
        sand: "#DBD8D6",
        ice: "#C2E3E7",
        text: "#5F5D6C",
        status: {
          preorder: "#F2C94C",
          instock: "#27AE60",
          closed: "#EB5757"
        }
      },
      boxShadow: {
        soft: "0 14px 28px rgba(78, 98, 106, 0.12)",
        lift: "0 22px 50px rgba(78, 98, 106, 0.18)"
      },
      borderRadius: {
        xl: "28px",
        lg: "22px"
      },
      backgroundImage: {
        "hero-glow": "radial-gradient(circle at top, rgba(255,255,255,0.9), #DBD8D6 58%, #e9e6e3 100%)"
      }
    },
    fontFamily: {
      sans: ["var(--font-manrope)", "sans-serif"],
      display: ["var(--font-fraunces)", "serif"]
    }
  },
  plugins: []
};

export default config;
