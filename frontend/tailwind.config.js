// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // Include all component files in `src` folder
  ],
  theme: {
    extend: {
      colors: {
        'custom-light-gray': '#f9f9f9',
      },
    },
  },
  plugins: [],
};
