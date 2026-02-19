/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Essential for the theme toggle you added
  theme: {
    extend: {
      colors: {
        // Custom 'Chad' Orange palette
        chad: {
          light: '#fb923c',
          DEFAULT: '#ea580c',
          dark: '#9a3412',
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.900'),
            a: {
              color: theme('colors.orange.600'),
              '&:hover': {
                color: theme('colors.orange.500'),
              },
            },
            // Makes code blocks look like ChatGPT/Gemini
            code: {
              backgroundColor: theme('colors.gray.100'),
              padding: '2px 4px',
              borderRadius: '4px',
              fontWeight: '600',
            },
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },
          },
        },
        invert: {
          css: {
            color: theme('colors.gray.300'),
            a: {
              color: theme('colors.orange.400'),
            },
            code: {
              backgroundColor: theme('colors.gray.800'),
              color: theme('colors.orange.300'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // This is what fixes the "attractive" reply issue
  ],
}
