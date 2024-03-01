import fs from "fs";

// Define the LS_COLORS content by reading this from environment variable LS_COLORS
const lsColorsContent = process.env.LS_COLORS!;

// Helper function to convert RGB to Hex
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

// Generate the 256-color palette
function generate256ColorPalette(): { [key: number]: string } {
  const palette: { [key: number]: string } = {};

  // Generate the 6x6x6 color cube
  for (let r = 0; r < 6; r++) {
    for (let g = 0; g < 6; g++) {
      for (let b = 0; b < 6; b++) {
        const index = 16 + r * 36 + g * 6 + b;
        palette[index] = rgbToHex(r * 51, g * 51, b * 51);
      }
    }
  }

  // Generate the grayscale spectrum
  for (let i = 0; i < 24; i++) {
    const shade = 8 + i * 10;
    const index = 232 + i;
    palette[index] = rgbToHex(shade, shade, shade);
  }

  return palette;
}

const palette = generate256ColorPalette();

// Function to convert ANSI code to hex, now more robust
function ansiCodeToHex(code: string | undefined): { fg?: string; bg?: string } {
  if (!code) {
    return {}; // Return empty if no code provided
  }

  const acc: { fg?: string; bg?: string } = {};
  if (code.startsWith("38;5;")) {
    const num = parseInt(code.slice(5), 10);
    acc.fg = palette[num] || "#ffffff"; // Default to white if not found
  } else if (code.startsWith("48;5;")) {
    const num = parseInt(code.slice(5), 10);
    acc.bg = palette[num] || "#ffffff"; // Default to white if not found
  }

  return acc;
}

// Parse LS_COLORS and convert to theme.toml content, now handling potential undefined codes
function convertLsColorsToToml(lsColors: string): string {
  const entries = lsColors.split(":");
  const rules = entries
    .map((entry) => {
      const [pattern, codes] = entry.split("=", 2); // Ensure only the first '=' is used to split
      const { fg, bg } = ansiCodeToHex(codes);
      let rule = `  { name = "${pattern}"`;
      if (fg) rule += `, fg = "${fg}"`;
      if (bg) rule += `, bg = "${bg}"`;
      rule += " }";
      return rule;
    })
    .filter((rule) => rule.includes("fg") || rule.includes("bg")); // Filter out entries without colors

  return rules.join(",\n");
}

const themeTomlContent = convertLsColorsToToml(lsColorsContent);

console.log(themeTomlContent);
// Optionally, write to a file
// fs.writeFileSync('theme.toml', themeTomlContent);
