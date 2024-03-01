import fs from "fs";

// Define the LS_COLORS content. In a real scenario, you would read this from the process.env.LS_COLORS
const lsColorsContent = process.env.LS_COLORS!;

// Helper function to convert RGB to Hex
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

// Generate the 256-color palette
function generate256ColorPalette(): { [key: number]: string } {
  const palette: { [key: number]: string } = {};

  // Standard colors and bright colors (manual addition might be necessary based on the environment)

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

// Function to convert ANSI code to hex
function ansiCodeToHex(code: string): string {
  const pattern = /38;5;(\d+)/;
  const match = pattern.exec(code);
  if (match) {
    const colorIndex = parseInt(match[1], 10);
    return palette[colorIndex] || "#ffffff"; // Default to white
  }
  return "#ffffff"; // Default if no match
}

// Parse LS_COLORS and convert to theme.toml content
function convertLsColorsToToml(lsColors: string): string {
  const entries = lsColors.split(":");
  const rules = entries.map((entry) => {
    const [pattern, codes] = entry.split("=");
    const hexColor = ansiCodeToHex(codes);
    return `  { name = "${pattern}", fg = "${hexColor}" }`;
  });

  return `[filetype]\n\nrules = [\n${rules.join(",\n")}\n]`;
}

const themeTomlContent = convertLsColorsToToml(lsColorsContent);

console.log(themeTomlContent);
// Optionally, write to a file
// fs.writeFileSync('theme.toml', themeTomlContent);
