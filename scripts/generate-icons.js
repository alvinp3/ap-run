/**
 * Generate PWA Icons for BQ Training App
 *
 * Creates PNG icons in all required sizes from an SVG template.
 * Requires: npm install canvas (or use Squoosh, RealFaviconGenerator, or Figma export)
 *
 * Usage: node scripts/generate-icons.js
 *
 * Alternative: Use https://realfavicongenerator.net with the SVG below,
 * download the package, and extract icons to public/icons/
 */

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG icon template — teal running figure on dark background
const svgTemplate = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <!-- Background -->
  <rect width="512" height="512" rx="${Math.round(size * 0.2)}" fill="#0F172A"/>

  <!-- Teal accent circle -->
  <circle cx="256" cy="220" r="160" fill="none" stroke="#2DD4BF" stroke-width="8" opacity="0.15"/>

  <!-- Running figure (simplified) -->
  <!-- Head -->
  <circle cx="256" cy="145" r="30" fill="#2DD4BF"/>

  <!-- Body -->
  <path d="M256 175 L240 260 L225 330" stroke="#2DD4BF" stroke-width="14" stroke-linecap="round" fill="none"/>
  <path d="M256 175 L272 260 L287 330" stroke="#1E9B8A" stroke-width="14" stroke-linecap="round" fill="none"/>

  <!-- Arms -->
  <path d="M250 200 L210 240 L195 225" stroke="#2DD4BF" stroke-width="12" stroke-linecap="round" fill="none"/>
  <path d="M262 200 L302 225 L317 210" stroke="#1E9B8A" stroke-width="12" stroke-linecap="round" fill="none"/>

  <!-- BQ text at bottom -->
  <text x="256" y="410"
    font-family="'Arial Black', sans-serif"
    font-size="80"
    font-weight="900"
    fill="#2DD4BF"
    text-anchor="middle"
    letter-spacing="-2">BQ</text>
</svg>
`;

// Check if canvas is available
try {
  const { createCanvas, loadImage } = require('canvas');
  const fs = require('fs');
  const path = require('path');
  const { JSDOM } = require('jsdom');

  const iconsDir = path.join(__dirname, '../public/icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // For each size, render the SVG to a PNG
  // This requires canvas + svg support which needs additional setup
  // In most cases, use the online tool instead

  console.log('Canvas detected. Generating icons...');
  console.log('Note: SVG-to-PNG rendering via canvas requires additional setup.');
  console.log('Recommended: Use https://realfavicongenerator.net instead.\n');

  sizes.forEach((size) => {
    const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
    fs.writeFileSync(svgPath, svgTemplate(size));
    console.log(`✓ Wrote SVG: icon-${size}x${size}.svg`);
  });

  console.log('\nSVG icons written. Convert to PNG using:');
  console.log('  - https://cloudconvert.com/svg-to-png');
  console.log('  - Figma (import SVG, export as PNG at each size)');
  console.log('  - inkscape --export-png=icon-512x512.png icon-512x512.svg');

} catch {
  const fs = require('fs');
  const path = require('path');

  const iconsDir = path.join(__dirname, '../public/icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Write SVG files as fallback
  sizes.forEach((size) => {
    const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
    fs.writeFileSync(svgPath, svgTemplate(size));
  });

  console.log('SVG icons generated in public/icons/');
  console.log('\nTo convert to PNG (required for iOS PWA):');
  console.log('  Option A: https://realfavicongenerator.net — upload the 512x512 SVG');
  console.log('  Option B: npx svgexport public/icons/icon-512x512.svg public/icons/icon-512x512.png 512:512');
  console.log('  Option C: Figma → import SVG → export PNG at each size');
  console.log('\nRequired sizes:', sizes.map(s => `${s}x${s}`).join(', '));
}
