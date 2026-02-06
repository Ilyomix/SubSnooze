#!/usr/bin/env node
/**
 * Generate PWA icons at required sizes from the SVG source.
 * Produces standard icons (192, 256, 384, 512) + maskable variants.
 * Usage: node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../public/icons");
mkdirSync(outDir, { recursive: true });

const PRIMARY = "#237A5A";
const SIZES = [192, 256, 384, 512];

function svgIcon(size, maskable = false) {
  const padding = maskable ? Math.round(size * 0.1) : 0;
  const inner = size - padding * 2;
  const rx = maskable ? 0 : Math.round(inner * 0.208);
  const fontSize = Math.round(inner * 0.47);
  const textY = padding + Math.round(inner * 0.65);
  const cx = size / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${maskable ? `<rect width="${size}" height="${size}" fill="${PRIMARY}"/>` : ""}
  <rect x="${padding}" y="${padding}" width="${inner}" height="${inner}" rx="${rx}" fill="${PRIMARY}"/>
  <text x="${cx}" y="${textY}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white">S</text>
</svg>`;
}

async function generate() {
  for (const size of SIZES) {
    // Standard icon
    const stdSvg = Buffer.from(svgIcon(size, false));
    await sharp(stdSvg).resize(size, size).png().toFile(resolve(outDir, `icon-${size}.png`));
    console.log(`  icon-${size}.png`);

    // Maskable icon (10% safe zone padding)
    const maskSvg = Buffer.from(svgIcon(size, true));
    await sharp(maskSvg).resize(size, size).png().toFile(resolve(outDir, `icon-${size}-maskable.png`));
    console.log(`  icon-${size}-maskable.png`);
  }

  // Also generate the root icon-192.png (currently 0 bytes)
  const rootSvg = Buffer.from(svgIcon(192, false));
  await sharp(rootSvg).resize(192, 192).png().toFile(resolve(__dirname, "../public/icon-192.png"));
  console.log("  public/icon-192.png (root)");

  // Apple touch icon (180px)
  const appleSvg = Buffer.from(svgIcon(180, false));
  await sharp(appleSvg).resize(180, 180).png().toFile(resolve(outDir, `apple-touch-icon.png`));
  console.log("  apple-touch-icon.png");

  console.log("Done! Icons generated in public/icons/");
}

generate().catch((err) => {
  console.error("Icon generation failed:", err);
  process.exit(1);
});
