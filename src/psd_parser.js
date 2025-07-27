// psd_parser.js
// This script parses a PSD buffer into base64 PNG frames using psd.js

import { readPsd, renderPsd } from "psd.js"; // Assumes psd.js is available

export async function parsePsdFrames(psdBuffer) {
  try {
    const psd = await readPsd(psdBuffer);
    const root = psd.children;

    // Optional: sort layers top to bottom (PSD top layer is first in Photopea)
    const orderedLayers = [...root].reverse();

    const frameDataUrls = [];
    for (const layer of orderedLayers) {
      if (!layer.canvas) continue; // skip non-visual layers

      const canvas = document.createElement("canvas");
      canvas.width = psd.width;
      canvas.height = psd.height;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#ffffff"; // Background fill
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(layer.canvas, layer.left, layer.top);

      const dataUrl = canvas.toDataURL("image/png");
      frameDataUrls.push(dataUrl);
    }

    return frameDataUrls;
  } catch (e) {
    console.error("❌ Failed to parse PSD:", e);
    return [];
  }
}

