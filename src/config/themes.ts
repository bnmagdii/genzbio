import { ThemeConfig } from "../types";

export const THEME_PRESETS: ThemeConfig[] = [
  // === GALAXY CATEGORY ===
  {
    id: "purple-galaxy",
    name: "Purple Galaxy",
    category: "Galaxy",
    settings: {
      backgroundType: "gradient",
      backgroundValue: "linear-gradient(135deg, #0f0c1b, #050816, #1f1135)",
      cardBg: "rgba(15, 23, 42, 0.65)",
      cardBorder: "rgba(124, 58, 237, 0.3)",
      textColor: "#f3f4f6",
      accentColor: "#7C3AED",
      buttonStyle: "neon",
      fontFamily: "var(--font-orbitron)"
    }
  },
  {
    id: "nebula-drift",
    name: "Nebula Drift",
    category: "Galaxy",
    settings: {
      backgroundType: "gradient",
      backgroundValue: "linear-gradient(135deg, #050816, #2d124d, #4d1234)",
      cardBg: "rgba(15, 23, 42, 0.7)",
      cardBorder: "rgba(217, 70, 239, 0.35)",
      textColor: "#f3f4f6",
      accentColor: "#D946EF",
      buttonStyle: "glow",
      fontFamily: "var(--font-orbitron)"
    }
  },
  {
    id: "deep-space",
    name: "Deep Space",
    category: "Galaxy",
    settings: {
      backgroundType: "gradient",
      backgroundValue: "linear-gradient(180deg, #020205, #050816, #000000)",
      cardBg: "rgba(9, 15, 30, 0.8)",
      cardBorder: "rgba(255, 255, 255, 0.1)",
      textColor: "#e5e7eb",
      accentColor: "#22D3EE",
      buttonStyle: "glass",
      fontFamily: "var(--font-geist-sans)"
    }
  },
  {
    id: "cyber-space",
    name: "Cyber Space",
    category: "Cyber",
    settings: {
      backgroundType: "gradient",
      backgroundValue: "linear-gradient(135deg, #030008, #0d001a, #001f1f)",
      cardBg: "rgba(0, 5, 15, 0.85)",
      cardBorder: "rgba(34, 211, 238, 0.4)",
      textColor: "#ffffff",
      accentColor: "#22D3EE",
      buttonStyle: "neon",
      fontFamily: "var(--font-orbitron)"
    }
  },
  {
    id: "synthwave",
    name: "Synthwave Neon",
    category: "Cyber",
    settings: {
      backgroundType: "gradient",
      backgroundValue: "linear-gradient(180deg, #120024, #050014, #2b001a)",
      cardBg: "rgba(17, 0, 28, 0.75)",
      cardBorder: "rgba(217, 70, 239, 0.5)",
      textColor: "#ffe5ff",
      accentColor: "#D946EF",
      buttonStyle: "neon",
      fontFamily: "var(--font-orbitron)"
    }
  },
  {
    id: "black-hole",
    name: "Black Hole",
    category: "Galaxy",
    settings: {
      backgroundType: "solid",
      backgroundValue: "#000000",
      cardBg: "rgba(10, 10, 10, 0.9)",
      cardBorder: "rgba(255, 255, 255, 0.05)",
      textColor: "#9ca3af",
      accentColor: "#ffffff",
      buttonStyle: "solid",
      fontFamily: "var(--font-geist-sans)"
    }
  },
  {
    id: "glass-purple",
    name: "Glass Purple",
    category: "Glass",
    settings: {
      backgroundType: "gradient",
      backgroundValue: "linear-gradient(135deg, #1c0f30, #0c0817)",
      cardBg: "rgba(255, 255, 255, 0.07)",
      cardBorder: "rgba(255, 255, 255, 0.15)",
      textColor: "#ffffff",
      accentColor: "#A855F7",
      buttonStyle: "glass",
      fontFamily: "var(--font-geist-sans)"
    }
  },
  {
    id: "aurora",
    name: "Stellar Aurora",
    category: "Atmosphere",
    settings: {
      backgroundType: "gradient",
      backgroundValue: "linear-gradient(135deg, #050816, #071f1a, #0c3325)",
      cardBg: "rgba(15, 23, 42, 0.6)",
      cardBorder: "rgba(16, 185, 129, 0.3)",
      textColor: "#ecfdf5",
      accentColor: "#10B981",
      buttonStyle: "glow",
      fontFamily: "var(--font-geist-sans)"
    }
  },
  {
    id: "midnight",
    name: "Midnight Space",
    category: "Galaxy",
    settings: {
      backgroundType: "gradient",
      backgroundValue: "linear-gradient(180deg, #020617, #0f172a, #020617)",
      cardBg: "rgba(30, 41, 59, 0.5)",
      cardBorder: "rgba(255, 255, 255, 0.1)",
      textColor: "#f1f5f9",
      accentColor: "#6366f1",
      buttonStyle: "glass",
      fontFamily: "var(--font-geist-sans)"
    }
  },
  {
    id: "supernova",
    name: "Supernova Flare",
    category: "Atmosphere",
    settings: {
      backgroundType: "gradient",
      backgroundValue: "linear-gradient(135deg, #050816, #3b0764, #701a75)",
      cardBg: "rgba(15, 23, 42, 0.7)",
      cardBorder: "rgba(217, 70, 239, 0.4)",
      textColor: "#ffffff",
      accentColor: "#F43F5E",
      buttonStyle: "glow",
      fontFamily: "var(--font-orbitron)"
    }
  },
  {
    id: "dark-matter",
    name: "Dark Matter",
    category: "Monochrome",
    settings: {
      backgroundType: "solid",
      backgroundValue: "#0c0a0f",
      cardBg: "rgba(20, 18, 24, 0.8)",
      cardBorder: "rgba(124, 58, 237, 0.15)",
      textColor: "#e2e0e5",
      accentColor: "#8b5cf6",
      buttonStyle: "glass",
      fontFamily: "var(--font-geist-sans)"
    }
  }
];

// Automatically compile additional variations up to 55+ named cosmic theme combinations
const generateExtraThemes = () => {
  const categories = ["Galaxy", "Atmosphere", "Cyber", "Glass", "Monochrome"];
  const fonts = ["var(--font-orbitron)", "var(--font-geist-sans)"];
  const buttons = ["glass", "neon", "glow", "solid", "retro"];
  
  const planetaryAdjectives = [
    "Andromeda", "Orion", "Pulsar", "Quasar", "Eclipse", "Comet Dust", "Solar Flare",
    "Time Warp", "Hyperdrive", "Quantum Core", "White Dwarf", "Carbon Void", "Cosmic Dust",
    "Nebula Fog", "Venus Glow", "Mars Orbit", "Jupiter Gas", "Saturn Ring", "Uranus Glow",
    "Neptune Frost", "Pluto Cold", "Proxima Centauri", "Kepler Portal", "Milky Way",
    "Space Storm", "Titan Surface", "Europa Ice", "Io Sulfur", "Callisto Deep",
    "Helios Shield", "Void Walker", "Dark Energy", "Cosmic Ray", "Light Speed",
    "Galactic Core", "Event Horizon", "Asteroid Belt", "Oort Cloud", "Stardust Dust",
    "Solar Wind", "Starlight Glow", "Cosmic Mist", "Matrix Core", "Cyber Grid",
    "Neon Pulse", "Stellar Blast"
  ];

  const presetsList: ThemeConfig[] = [...THEME_PRESETS];

  planetaryAdjectives.forEach((name, i) => {
    const category = categories[i % categories.length] as any;
    const font = fonts[i % fonts.length];
    const button = buttons[i % buttons.length] as any;
    
    // Choose custom gradient hashes for variety
    const colors = [
      ["#050816", "#1e1b4b", "#4338ca"], // indigo space
      ["#020617", "#0f172a", "#1e293b"], // slate cosmos
      ["#090514", "#2e0854", "#5c0e8a"], // purple void
      ["#030712", "#111827", "#1f2937"], // dark gray orbit
      ["#08020d", "#1e0b36", "#0b1e36"], // blue-purple warp
      ["#02080f", "#081e36", "#0d3a68"], // blue galaxy
      ["#080a0f", "#0f2310", "#183e1c"], // cyber moss
      ["#050505", "#141414", "#262626"], // carbon gray
      ["#0c0614", "#260e1a", "#4a0e17"], // blood moon glow
      ["#020813", "#061b36", "#08335c"]  // abyss ice
    ];

    const pickColor = colors[i % colors.length];
    const accentColors = ["#7C3AED", "#A855F7", "#D946EF", "#22D3EE", "#10B981", "#EF4444", "#F59E0B", "#EC4899"];
    const accent = accentColors[i % accentColors.length];

    presetsList.push({
      id: `generated-theme-${i}`,
      name: `${name}`,
      category,
      settings: {
        backgroundType: "gradient",
        backgroundValue: `linear-gradient(135deg, ${pickColor[0]}, ${pickColor[1]}, ${pickColor[2]})`,
        cardBg: category === "Glass" ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.7)",
        cardBorder: category === "Glass" ? "rgba(255, 255, 255, 0.12)" : `rgba(${hexToRgb(accent)}, 0.35)`,
        textColor: category === "Glass" ? "#ffffff" : "#f1f5f9",
        accentColor: accent,
        buttonStyle: button,
        fontFamily: font
      }
    });
  });

  return presetsList;
};

// Helper hex convertor to format rgba borders dynamically
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "124, 58, 237";
}

export const ALL_THEMES = generateExtraThemes();
export const THEME_CATEGORIES = ["Galaxy", "Atmosphere", "Cyber", "Glass", "Monochrome"];
