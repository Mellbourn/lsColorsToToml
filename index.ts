import fs from "fs";

// Define the LS_COLORS content by reading this from environment variable LS_COLORS
const lsColorsContent = process.env.LS_COLORS!;
//const lsColorsContent = "*.patch=48;5;197;38;5;232;1";

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
        palette[index] = rgbToHex((r ? 55 : 0) + r * 40, (g ? 55 : 0) + g * 40, (b ? 55 : 0) + b * 40);
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

type Style = { fg?: string; bg?: string; bold?: boolean; underline?: boolean };

// Function to convert ANSI code to hex, now more robust
function ansiCodeToHex(code: string): Style {
  const colors: Style = {};
  if (!code) {
    return {}; // Return empty if no code provided
  }
  const parts = code.split(";");

  for (let i = 0; i < parts.length; i++) {
    // Check if the current part is '38' and the next is '5', indicating a foreground color code
    if (parts[i] === "38" && parts[i + 1] === "5") {
      const colorIndex = parseInt(parts[i + 2], 10);
      if (!isNaN(colorIndex)) {
        // Ensure that the color index is a number
        colors.fg = palette[colorIndex] || "#ffffff"; // Assign foreground color
        i += 2; // Skip the next two parts as they have been processed
      }
    }
    // Check if the current part is '48' and the next is '5', indicating a background color code
    else if (parts[i] === "48" && parts[i + 1] === "5") {
      const colorIndex = parseInt(parts[i + 2], 10);
      if (!isNaN(colorIndex)) {
        // Ensure that the color index is a number
        colors.bg = palette[colorIndex] || "#ffffff"; // Assign background color
        i += 2; // Skip the next two parts as they have been processed
      }
    } else if (parts[i] === "1") {
      colors.bold = true;
    } else if (parts[i] === "4") {
      colors.underline = true;
    }
  }

  return colors;
}

type YaziPattern = { name: string; is?: string };
function lsPatternToYazi(lsColorsPattern: string): YaziPattern {
  if (lsColorsPattern.length < 3) {
    const patternMap: { [key: string]: YaziPattern | undefined } = {
      di: { name: "*/" },
      bd: { name: "*", is: "block" },
      cd: { name: "*", is: "char" },
      ex: { name: "*", is: "exec" },
      pi: { name: "*", is: "fifo" },
      ln: { name: "*", is: "link" },
      or: { name: "*", is: "orphan" },
      so: { name: "*", is: "sock" },
      st: { name: "*", is: "sticky" }
    };

    const mappedPattern = patternMap[lsColorsPattern];
    if (mappedPattern) {
      return mappedPattern;
    }

    return { name: "" };
  } else {
    return { name: lsColorsPattern };
  }
}

// Parse LS_COLORS and convert to theme.toml content, now handling potential undefined codes
function convertLsColorsToToml(lsColors: string): string {
  const entries = lsColors.split(":");
  const rules = entries
    .map((entry) => {
      const [pattern, codes] = entry.split("=", 2); // Ensure only the first '=' is used to split

      const { name, is } = lsPatternToYazi(pattern);
      if (!name) return "";
      const { fg, bg, bold, underline } = ansiCodeToHex(codes);

      let rule = `  { name = "${name}"`;
      if (is) rule += `, is = "${is}"`;
      if (fg) rule += `, fg = "${fg}"`;
      if (bg) rule += `, bg = "${bg}"`;
      if (bold) rule += `, bold = true`;
      if (underline) rule += `, underline = true`;
      rule += " }";
      return rule;
    })
    .filter(
      (rule) =>
        rule.includes("fg") ||
        rule.includes("bg") ||
        rule.includes("bold") ||
        rule.includes("underline")
    ); // Filter out entries without colors

  return rules.join(",\n") + ",";
}

const themeTomlContent = convertLsColorsToToml(lsColorsContent);

console.log(themeTomlContent);
// Optionally, write to a file
// fs.writeFileSync('theme.toml', themeTomlContent);
