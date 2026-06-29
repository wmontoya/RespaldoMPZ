import { copyFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

const sourceDir = path.join(projectRoot, 'node_modules', 'leaflet', 'dist', 'images');
const targetDir = path.join(projectRoot, 'public', 'leaflet', 'images');

const files = [
  'layers.png',
  'layers-2x.png',
  'marker-icon.png',
  'marker-icon-2x.png',
  'marker-shadow.png',
];

if (!existsSync(sourceDir)) {
  process.exit(0);
}

await mkdir(targetDir, { recursive: true });

await Promise.all(
  files.map(async (file) => {
    const src = path.join(sourceDir, file);
    const dst = path.join(targetDir, file);
    if (!existsSync(src)) return;
    await copyFile(src, dst);
  })
);

