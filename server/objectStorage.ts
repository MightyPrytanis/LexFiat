import fs from "fs/promises";
import path from "path";
import { Response } from "express";
import { randomUUID } from "crypto";

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  constructor() {}

  getPublicObjectSearchPaths(): Array<string> {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "public/uploads,public/assets";
    const paths = Array.from(
      new Set(
        pathsStr
          .split(",")
          .map((path) => path.trim())
          .filter((path) => path.length > 0)
      )
    );
    return paths;
  }

  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || "private/uploads";
    return dir;
  }

  async searchPublicObject(filePath: string): Promise<string | null> {
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = path.join(process.cwd(), searchPath, filePath);
      try {
        await fs.access(fullPath);
        return fullPath;
      } catch {
        // File doesn't exist in this path, continue searching
      }
    }
    return null;
  }

  async downloadObject(filePath: string, res: Response, cacheTtlSec: number = 3600) {
    try {
      const stats = await fs.stat(filePath);
      const ext = path.extname(filePath).toLowerCase();
      
      // Basic content type detection
      const contentTypeMap: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
        '.json': 'application/json',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.html': 'text/html',
      };

      const contentType = contentTypeMap[ext] || 'application/octet-stream';

      res.set({
        "Content-Type": contentType,
        "Content-Length": stats.size.toString(),
        "Cache-Control": `public, max-age=${cacheTtlSec}`,
      });

      const fileBuffer = await fs.readFile(filePath);
      res.send(fileBuffer);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }

  async getObjectEntityUploadURL(): Promise<string> {
    const privateObjectDir = this.getPrivateObjectDir();
    const objectId = randomUUID();
    const fullPath = path.join(process.cwd(), privateObjectDir, 'uploads', objectId);
    
    // Ensure the directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    
    // Return a local file path that can be used for uploads
    // This is a simplified approach - in a real implementation, 
    // you might want to use a proper upload handling mechanism
    return fullPath;
  }

  async saveFile(filePath: string, buffer: Buffer): Promise<void> {
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);
  }
}