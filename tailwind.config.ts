import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui required CSS variable mappings
        background:  "var(--background)",
        foreground:  "var(--foreground)",
        card:        { DEFAULT: "var(--card)",        foreground: "var(--card-foreground)" },
        popover:     { DEFAULT: "var(--popover)",     foreground: "var(--popover-foreground)" },
        primary:     { DEFAULT: "var(--primary)",     foreground: "var(--primary-foreground)" },
        secondary:   { DEFAULT: "var(--secondary)",   foreground: "var(--secondary-foreground)" },
        muted:       { DEFAULT: "var(--muted)",       foreground: "var(--muted-foreground)" },
        accent:      { DEFAULT: "var(--accent)",      foreground: "var(--accent-foreground)" },
        destructive: { DEFAULT: "var(--destructive)", foreground: "var(--destructive-foreground)" },
        border:      "var(--border)",
        input:       "var(--input)",
        ring:        "var(--ring)",
        // 7 Log custom palette
        forest:  { DEFAULT: '#2D6A4F', light: '#52B788', dark: '#1B4332' },
        sunset:  { DEFAULT: '#F4A261', light: '#FFDDD2', dark: '#E76F51' },
        sky:     { DEFAULT: '#2D9CDB', light: '#90E0EF', dark: '#0077B6' },
        night:   { DEFAULT: '#1A1A2E', card: '#16213E', border: '#0F3460' },
        owe:     '#E63946',
        gets:    '#2D9CDB',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans:    ['var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-space-grotesk)', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'bounce-in':  'bounceIn 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        'shimmer':    'shimmer 1.4s infinite',
        'ticker':     'ticker 30s linear infinite',
        'wiggle':     'wiggle 0.5s ease-in-out',
        'float':      'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:   { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDown: { '0%': { transform: 'translateY(-20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        bounceIn:  { '0%': { transform: 'scale(0.3)', opacity: '0' }, '50%': { transform: 'scale(1.05)' }, '70%': { transform: 'scale(0.9)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        ticker:    { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'translateX(-100%)' } },
        wiggle:    { '0%, 100%': { transform: 'rotate(-3deg)' }, '50%': { transform: 'rotate(3deg)' } },
        float:     { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
      },
    },
  },
  plugins: [],
};

export default config;
