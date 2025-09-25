import { createReadStream, promises as fs } from "node:fs";
import * as path from "node:path";
import type { Response } from "express";
import { randomUUID } from "node:crypto";

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
    const pathsStr: string = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "public/uploads,public/assets";
    const rawPaths: Array<string> = pathsStr.split(",");
    const trimmedPaths: Array<string> = rawPaths.map((p: string) => p.trim());
    const nonEmptyPaths: Array<string> = trimmedPaths.filter((p: string) => p.length > 0);
    const uniquePaths: Array<string> = Array.from(new Set<string>(nonEmptyPaths));
    const paths: Array<string> = uniquePaths;
    return paths;
  }

  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || "private/uploads";
    return dir;
  }

  async searchPublicObject(filePath: string): Promise<string | null> {
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      // Compute the absolute search directory and the requested file path.
      const absSearchRoot = path.resolve(process.cwd(), searchPath);
      const candidatePath = path.resolve(absSearchRoot, filePath);
      // Ensure that the candidatePath is inside absSearchRoot
      if (!candidatePath.startsWith(absSearchRoot + path.sep)) {
        continue; // Potential path traversal, skip this candidate
      }
      try {
        await fs.access(candidatePath);
        return candidatePath;
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

      const fileStream = createReadStream(filePath);
      fileStream.on("error", (err: unknown) => {
        console.error("Stream error while downloading file:", err);
        if (!res.headersSent) {
          res.status(500).end("Error streaming file");
        } else {
          res.end();
        }
      });
      // Ensure we do not keep reading if client disconnects
      res.on("close", () => {
        fileStream.destroy();
      });
      fileStream.pipe(res);
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

  async saveFile(filePath: string, buffer: Uint8Array): Promise<void> {
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);
  }
}