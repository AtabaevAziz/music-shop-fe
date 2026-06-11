import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        xs: ["0.805rem", { lineHeight: "1rem" }], // 14px * 1.15 = 16.1px ≈ 0.805rem
        sm: ["0.92rem", { lineHeight: "1.25rem" }], // 16px * 1.15 = 18.4px ≈ 0.92rem
        base: ["1.035rem", { lineHeight: "1.5rem" }], // 18px * 1.15 = 20.7px ≈ 1.035rem
        lg: ["1.15rem", { lineHeight: "1.75rem" }], // 20px * 1.15 = 23px = 1.15rem
        xl: ["1.265rem", { lineHeight: "1.75rem" }], // 22px * 1.15 = 25.3px ≈ 1.265rem
        "2xl": ["1.38rem", { lineHeight: "2rem" }], // 24px * 1.15 = 27.6px ≈ 1.38rem
        "3xl": ["1.725rem", { lineHeight: "2.25rem" }], // 30px * 1.15 = 34.5px ≈ 1.725rem
        "4xl": ["2.07rem", { lineHeight: "2.5rem" }], // 36px * 1.15 = 41.4px ≈ 2.07rem
      },
      spacing: {
        "11": "2.875rem", // 44px - 15% larger than 2.5rem
        "13": "3.45rem", // 52px - 15% larger than 3rem
        "15": "3.91rem", // 62.5px - 15% larger than 3.5rem
        "17": "4.37rem", // 70px - 15% larger than 4rem
        "19": "4.83rem", // 77px - 15% larger than 4.25rem
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        auth: "url('/assets/images/auth.jpg')",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
