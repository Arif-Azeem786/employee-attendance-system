// tailwind.config.cjs
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          brand: '#10b981',
          'brand-dark': '#0ea36b',
        },
        fontFamily: {
          display: ['Inter', 'ui-sans-serif', 'system-ui'],
        },
      },
    },
    plugins: [],
  }
  