/** @type {import('tailwindcss').Config} */
const { blackA } = require("@radix-ui/colors");
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
				...blackA,
			},
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

