import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const versionFilePath = path.join(__dirname, '../../version.json');

export async function getVersion(req, res) {
  const raw = await readFile(versionFilePath, 'utf-8');
  res.json(JSON.parse(raw.replace(/^﻿/, '')));
}
