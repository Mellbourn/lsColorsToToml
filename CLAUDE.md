# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm i           # Install dependencies
npm run start   # Compile TypeScript and run (tsc && node index.js)
```

To capture output for use in yazi's theme.toml:
```sh
npm run start | tail -n +4 | pbcopy
```

There are no tests configured.

## Architecture

This is a single-file TypeScript CLI tool (`index.ts`) that converts the `LS_COLORS` environment variable into TOML entries for use in [yazi](https://github.com/sxyazi/yazi)'s `theme.toml`.

**Data flow:**
1. Reads `$LS_COLORS` from the environment at startup
2. Splits on `:` to get individual entries (each `pattern=ansi_codes`)
3. `lsPatternToYazi()` maps short LS_COLORS keys (e.g. `di`, `ln`, `ex`) to yazi `url`/`is` patterns; file glob patterns (e.g. `*.rs`) pass through as-is
4. `ansiCodeToHex()` parses semicolon-separated ANSI codes into a `Style` object — supports named colors (30–37, 90–96 fg; 40–47, 100–106 bg), 256-color palette (`38;5;N` / `48;5;N`), and 24-bit RGB (`38;2;R;G;B` / `48;2;R;G;B`), plus mode flags (bold, underline, etc.)
5. `convertLsColorsToToml()` assembles TOML inline table entries and prints them to stdout

**Key types:**
- `Style` — holds optional `fg`/`bg` colors and boolean mode flags
- `Color` — either `ColorNamed` (named string) or `ColorHex` (`#rrggbb`)
- `YaziPattern` — `{ url: string; is?: string }` for yazi filetype rule matching

The compiled `index.js` and `index.js.map` are committed alongside the source.
