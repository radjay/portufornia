module.exports = {
  content: ["./camz/*.html"],
  theme: {
    fontFamily: {
      originalSurfer: ["Original Surfer", "sans-serif"],
    },
    extend: {},
  },
  safelist: ["backdrop-blur-md", "backdrop-blur-lg"],
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
  plugins: [require("daisyui")],
};
