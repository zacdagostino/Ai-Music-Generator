import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Placeholder slideshow generator.
 * In production, swap this with ffmpeg-based composition using Ken Burns and crossfades.
 */
export async function generateSlideshowVideo(orderId: string, photoUrls: string[], durationSeconds: number) {
  const outputDir = path.join(process.cwd(), "public", "uploads", orderId);
  await mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, "slideshow-placeholder.mp4.txt");
  const content = JSON.stringify({
    note: "Slideshow placeholder. Replace with ffmpeg composition job.",
    durationSeconds,
    photos: photoUrls,
    transitions: "soft cross-fade + subtle zoom",
  });
  await writeFile(outputPath, content, "utf8");

  return `/uploads/${orderId}/slideshow-placeholder.mp4.txt`;
}
