/**
 * Inpartner Corporate Platform — Tailwind CSS Scoped Configuration
 * Specifically engineered for zero CSS collisions with Bootstrap 5.2.3.
 */
module.exports = {
  content: [
    './src/components/Chatbot/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  corePlugins: {
    preflight: false, // MANDATORY: Disabled to prevent overriding Bootstrap 5 CSS reset
  },
  important: '#inpartner-chatbot-container', // All Tailwind utility rules scoped strictly to this ID
  theme: {
    extend: {
      colors: {
        inpartner: {
          primary: '#0779D1',
          dark: '#0668b3',
          accent: '#d4af37',
        },
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'xs': '0.125rem',
        '2xs': '0.0625rem',
      },
    },
  },
  plugins: [],
};
