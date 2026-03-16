/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#818cf8',
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
        },
        slate: {
          950: '#020617',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.03)',
          dark: 'rgba(2, 6, 23, 0.6)',
        }
      },
      backgroundImage: {
        'mesh-gradient': "radial-gradient(at 0% 0%, hsla(222,47%,11%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(217,33%,17%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(222,47%,11%,1) 0, transparent 50%)",
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      backdropBlur: {
        'md': '12px',
        'lg': '20px',
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(0, 0, 0, 0.5), 0 1px 1px 0 rgba(255, 255, 255, 0.05)',
        'premium-hover': '0 20px 50px -15px rgba(0, 0, 0, 0.6), 0 1px 2px 0 rgba(255, 255, 255, 0.1)',
      }
    },
  },
  plugins: [],
}