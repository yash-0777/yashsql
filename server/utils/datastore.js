import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '..', 'data');

function getFilePath(key) {
  return path.join(dataDir, `${key}.json`);
}

export async function readJsonArray(key) {
  const file = getFilePath(key);
  try {
    const buf = await fs.readFile(file, 'utf-8');
    const data = JSON.parse(buf || '[]');
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

export async function writeJsonArray(key, data) {
  const file = getFilePath(key);
  const json = JSON.stringify(Array.isArray(data) ? data : [], null, 2);
  await fs.writeFile(file, json, 'utf-8');
}

