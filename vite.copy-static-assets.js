import { promises as fs } from 'fs';
import path from 'path';

/**
 * Recursively copy a directory
 */
async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Vite plugin to copy static assets after build
 */
export default function copyStaticAssets() {
  return {
    name: 'copy-static-assets',
    closeBundle: async () => {
      // Copy product images
      await copyDir('src/assets/images/products', 'dist/assets/images/products');
      // Copy brand images (favicons)
      await copyDir('src/assets/images/brand', 'dist/assets/images/brand');
    },
  };
}
