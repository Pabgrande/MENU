/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores de proteína/categoría
        'chip-pollo': '#FEF3C7',
        'chip-cerdo': '#FECACA',
        'chip-ternera': '#FED7AA',
        'chip-pescado': '#BFDBFE',
        'chip-huevo': '#FEF9C3',
        'chip-legumbres': '#D9F99D',
        'chip-pasta': '#FDBA74',
        'chip-arroz': '#FDE68A',
        'chip-verdura': '#86EFAC',
        'chip-fritura': '#FCA5A5',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
