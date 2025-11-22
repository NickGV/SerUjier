/**
 * Script para generar iconos PWA en diferentes tamaños
 * Requiere sharp: npm install sharp
 *
 * Uso: node scripts/generate-icons.js
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const PUBLIC_DIR = path.join(__dirname, "..", "public");
const SOURCE_ICON = path.join(PUBLIC_DIR, "UJIER(4).png"); // Tu logo original

const SIZES = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "favicon-16x16.png", size: 16 },
];

async function generateIcons() {
  try {
    // Verificar que existe el icono fuente
    if (!fs.existsSync(SOURCE_ICON)) {
      console.error("❌ No se encontró el icono fuente:", SOURCE_ICON);
      console.log("📝 Coloca tu logo en public/UJIER(4).png");
      return;
    }

    console.log("🎨 Generando iconos PWA...\n");

    for (const { name, size } of SIZES) {
      const outputPath = path.join(PUBLIC_DIR, name);

      await sharp(SOURCE_ICON)
        .resize(size, size, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generado: ${name} (${size}x${size})`);
    }

    // Generar favicon.ico
    const faviconPath = path.join(PUBLIC_DIR, "favicon.ico");
    await sharp(SOURCE_ICON).resize(32, 32).toFile(faviconPath);

    console.log(`✅ Generado: favicon.ico (32x32)`);

    console.log("\n🎉 ¡Iconos generados exitosamente!");
    console.log("\n📝 Siguiente paso:");
    console.log("   Actualiza manifest.json con los nuevos nombres de iconos");
  } catch (error) {
    console.error("❌ Error generando iconos:", error);
  }
}

generateIcons();
