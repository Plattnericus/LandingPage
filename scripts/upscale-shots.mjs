import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDir = path.join(process.cwd(), "public", "project-shots");
const outputDir = path.join(sourceDir, "8k");
const targetWidth = 7680;
const files = [
  "threejs-portfolio.png",
  "streamdeck.png",
  "finanzen.png",
  "campedell-app.png",
];

await fs.mkdir(outputDir, { recursive: true });

const compareRaw = async ({ originalPath, upscaledPath, width, height }) => {
  const original = await sharp(originalPath)
    .ensureAlpha()
    .raw()
    .toBuffer();
  const restored = await sharp(upscaledPath)
    .resize(width, height, {
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    })
    .ensureAlpha()
    .raw()
    .toBuffer();

  let absoluteError = 0;
  let squaredError = 0;

  for (let index = 0; index < original.length; index += 1) {
    const diff = original[index] - restored[index];
    absoluteError += Math.abs(diff);
    squaredError += diff * diff;
  }

  const mae = absoluteError / original.length;
  const mse = squaredError / original.length;
  const psnr = mse === 0 ? Infinity : 20 * Math.log10(255 / Math.sqrt(mse));

  return { mae, psnr };
};

const results = [];

for (const file of files) {
  const originalPath = path.join(sourceDir, file);
  const outputName = file.replace(/\.png$/, ".webp");
  const upscaledPath = path.join(outputDir, outputName);
  const metadata = await sharp(originalPath).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(`Could not read dimensions for ${file}`);
  }

  const height = Math.round((metadata.height / metadata.width) * targetWidth);

  await sharp(originalPath)
    .resize(targetWidth, height, {
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: false,
    })
    .webp({
      quality: 98,
      nearLossless: true,
      smartSubsample: true,
      effort: 4,
    })
    .toFile(upscaledPath);

  const comparison = await compareRaw({
    originalPath,
    upscaledPath,
    width: metadata.width,
    height: metadata.height,
  });

  const passed = comparison.mae < 4.5 && comparison.psnr > 35;

  results.push({
    file,
    output: path.relative(process.cwd(), upscaledPath),
    original: `${metadata.width}x${metadata.height}`,
    upscaled: `${targetWidth}x${height}`,
    mae: Number(comparison.mae.toFixed(4)),
    psnr: Number(comparison.psnr.toFixed(2)),
    passed,
  });
}

console.log(JSON.stringify(results, null, 2));

const failed = results.filter((result) => !result.passed);

if (failed.length > 0) {
  throw new Error(`Upscaled images drifted too far from original: ${failed.map((result) => result.file).join(", ")}`);
}
