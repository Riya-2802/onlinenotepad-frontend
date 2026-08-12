/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        '3d': '0 18px 40px rgba(16, 24, 40, 0.14), 0 2px 0 rgba(255, 255, 255, 0.9) inset',
        'soft': '0 10px 30px rgba(16, 24, 40, 0.10)'
      },
      colors: {
        panel: '#f7f8fb',
        ink: '#0f172a'
      }
    }
  },
  plugins: []
};

module.exports = config;


