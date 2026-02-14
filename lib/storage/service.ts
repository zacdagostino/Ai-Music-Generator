import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export interface StorageService {
  putBuffer(key: string, data: Buffer, contentType: string): Promise<string>;
  putText(key: string, text: string): Promise<string>;
}

class LocalStorageService implements StorageService {
  private root = path.join(process.cwd(), "public", "uploads");

  async putBuffer(key: string, data: Buffer): Promise<string> {
    const filePath = path.join(this.root, key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, data);
    return `/uploads/${key}`;
  }

  async putText(key: string, text: string): Promise<string> {
    const filePath = path.join(this.root, key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, text, "utf8");
    return `/uploads/${key}`;
  }
}

class PlaceholderS3Service implements StorageService {
  async putBuffer(): Promise<string> {
    throw new Error("S3/R2 storage is not configured yet. Set STORAGE_DRIVER=local for now.");
  }

  async putText(): Promise<string> {
    throw new Error("S3/R2 storage is not configured yet. Set STORAGE_DRIVER=local for now.");
  }
}

export function getStorageService(): StorageService {
  if (process.env.STORAGE_DRIVER === "s3") return new PlaceholderS3Service();
  return new LocalStorageService();
}
