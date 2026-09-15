import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import type { StorageProvider, StorageUploadInput } from "./types";

const UPLOAD_DIR =
  process.env.STORAGE_LOCAL_PATH || path.join(process.cwd(), "data", "uploads");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export class LocalStorageProvider implements StorageProvider {
  name = "local";

  constructor() {
    ensureDir(UPLOAD_DIR);
  }

  async upload(input: StorageUploadInput): Promise<{ url: string; sizeBytes: number }> {
    const ext = path.extname(input.filename) || ".bin";
    const id = nanoid(16);
    const relDir = path.join(input.userId);
    const absDir = path.join(UPLOAD_DIR, relDir);
    ensureDir(absDir);

    const filename = `${id}${ext}`;
    const absPath = path.join(absDir, filename);
    fs.writeFileSync(absPath, input.buffer);

    const relUrl = `/api/assets/file/${input.userId}/${filename}`;
    return { url: relUrl, sizeBytes: input.buffer.length };
  }

  async delete(url: string): Promise<void> {
    const relPath = url.replace("/api/assets/file/", "");
    const absPath = path.join(UPLOAD_DIR, relPath);
    if (fs.existsSync(absPath)) {
      fs.unlinkSync(absPath);
    }
  }

  getUrl(path: string): string {
    return path;
  }
}
