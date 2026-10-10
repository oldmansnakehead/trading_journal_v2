/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/renderer/index.html',
    './src/renderer/src/**/*.{vue,js,ts,jsx,tsx}',
    './src/stories/**/*.{js,ts,jsx,tsx,vue,mdx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Bai Jamjuree"', 'sans-serif']
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: '#f9fafb', // From design, was hsl(var(--background))
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#7371f7',
          foreground: 'hsl(var(--primary-foreground))',
          light: '#a3a2f9',
          dark: '#4543db'
        },
        secondary: {
          DEFAULT: '#8e33ff',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        info: {
          DEFAULT: '#70b7f9'
        },
        success: {
          DEFAULT: '#55b526',
          dark: '#3d861a'
        },
        warning: {
          DEFAULT: '#ffd242',
          dark: '#d6aa22'
        },
        error: {
          DEFAULT: '#ff4332',
          dark: '#c42c1f'
        },
        textPrimary: '#212B36',
        textSecondary: '#637381',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        }
      },
      borderRadius: {
        xl: 'calc(var(--radius) + 4px)', // 0.75rem in base_design
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '1rem' // Added from design
      },
      boxShadow: {
        card: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)'
      }
    }
  },
  plugins: []
}
