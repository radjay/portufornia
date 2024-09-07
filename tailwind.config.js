module.exports = {
  content: ["./*.html"],
  theme: {
    fontFamily: {
      originalSurfer: ["Original Surfer", "sans-serif"],
    },
    extend: {},
  },
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
  plugins: [require("daisyui")],
};
