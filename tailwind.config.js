module.exports = {
  content: ["./*.html", "./camz/*.html"],
  theme: {
    fontFamily: {
      originalSurfer: ["Original Surfer", "sans-serif"],
    },
    extend: {
      touchAction: {
        none: "none",
        auto: "auto",
        "pan-x": "pan-x",
        "pan-y": "pan-y",
        manipulation: "manipulation",
      },
      userSelect: {
        none: "none",
        text: "text",
        all: "all",
      },
      transform: {
        "scale-102": "scale(1.02)",
      },
    },
  },
  safelist: [
    // Grid columns
    "grid-cols-1",
    "grid-cols-2",
    "grid-cols-3",
    "grid-cols-4",
    "grid-cols-5",
    "grid-cols-6",

    // Mobile menu
    "-translate-y-full",
    "transform",
    "transition-transform",
    "duration-300",
    "ease-in-out",

    // Focus rings
    "focus:ring-2",
    "focus:ring-[#5e6ad2]/50",

    // Backdrop and blur
    "backdrop-blur-md",
    "backdrop-blur-sm",

    // Spacing and layout
    "space-y-4",
    "space-y-2",
    "gap-2",
    "gap-4",

    // Colors and opacity
    "bg-[#2e2e2e]",
    "bg-[#363636]",
    "bg-black/80",
    "bg-black/50",
    "text-white/60",
    "text-white/75",
    "border-white/10",
    "border-white/15",

    // Header visibility
    "header-hidden",
    "hidden",
    "flex",
    "md:flex",
    "md:hidden",

    // Positioning
    "fixed",
    "md:relative",
    "top-0",
    "left-0",
    "right-0",
    "top-[41px]",
    "mt-[41px]",
    "md:mt-0",

    // Logo and image sizing
    "h-6",
    "w-auto",
    "brightness-0",
    "invert",

    // Container and layout
    "container",
    "mx-auto",
    "px-6",
    "py-2",
    "py-4",

    // Touch and interaction utilities
    "touch-none",
    "touch-auto",
    "touch-pan-x",
    "touch-pan-y",
    "touch-manipulation",
    "select-none",
    "select-text",
    "select-all",
    "cursor-grab",
    "cursor-grabbing",
    "scale-102",
    "opacity-90",
    "opacity-50",
    "shadow-lg",
    "border-dashed",
    "border-white/50",

    // Other utilities
    "overflow-hidden",
    "z-20",
    "z-50",
    "z-[100]",
    "cursor-pointer",
    "cursor-move",
  ],
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
  plugins: [require("daisyui")],
};
