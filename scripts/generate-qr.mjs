import { fileURLToPath } from "node:url";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import QRCode from "qrcode";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetUrl =
    process.env.QR_TARGET_URL || "https://kopikenangan-sticker.vercel.app/3d";
const outputDir = path.resolve(__dirname, "../public");
const outputFilename = process.env.QR_FILENAME || "qr-kopikenangan-3d.png";
const outputPath = path.join(outputDir, outputFilename);

const qrOptions = {
    width: 1024,
    margin: 2,
    color: {
        dark: "#0f172a",
        light: "#ffffff",
    },
};

async function generate() {
    await mkdir(outputDir, { recursive: true });
    const pngBuffer = await QRCode.toBuffer(targetUrl, qrOptions);
    await writeFile(outputPath, pngBuffer);
    console.log(`QR code generated for ${targetUrl} -> ${outputPath}`);
}

generate().catch((error) => {
    console.error("Failed to generate QR code", error);
    process.exitCode = 1;
});
