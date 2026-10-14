const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.js", // status colours live in lib/constants.js
  ],
  theme: {
    extend: {
      colors: {
        canvas: token("canvas"),
        surface: token("surface"),
        subtle: token("subtle"),
        line: token("line"),
        fg: token("fg"),
        muted: token("muted"),
        brand: token("brand"),
        "brand-soft": token("brand-soft"),
        link: token("link"),
      },
      boxShadow: {
        card: "0 1px 2px rgb(0 0 0 / 0.04), 0 1px 3px rgb(0 0 0 / 0.05)",
        pop: "0 12px 32px -12px rgb(0 0 0 / 0.28)",
      },
    },
  },
  plugins: [],
};
