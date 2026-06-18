import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
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
