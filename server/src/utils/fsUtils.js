import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(path.join(__dirname, '../../'));

export const dataDir = path.join(rootDir, 'data');
export const uploadsDir = path.join(rootDir, 'uploads');
export const dbFilePath = path.join(dataDir, 'db.json');

export function ensureDataDirs() {
  fs.ensureDirSync(dataDir);
  fs.ensureDirSync(uploadsDir);
  if (!fs.existsSync(dbFilePath)) {
    const initial = { users: [], recipes: [] };
    fs.writeJsonSync(dbFilePath, initial, { spaces: 2 });
  }
}

export async function readDb() {
  await fs.ensureFile(dbFilePath);
  const content = await fs.readFile(dbFilePath, 'utf-8');
  if (!content) {
    const initial = { users: [], recipes: [] };
    await fs.writeJson(dbFilePath, initial, { spaces: 2 });
    return initial;
  }
  try {
    return JSON.parse(content);
  } catch (err) {
    throw new Error('Failed to parse db.json');
  }
}

export async function writeDb(db) {
  await fs.writeJson(dbFilePath, db, { spaces: 2 });
}

export function toPublicUrl(localPath) {
  if (!localPath) return null;
  if (localPath.startsWith('/uploads')) return localPath;
  return `/uploads/${path.basename(localPath)}`;
}

export function sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

