import fs from 'fs/promises';
import path from 'path';
import https from 'https';

const MODELS_DIR = path.resolve(process.cwd(), 'models', 'face-api');

const files = [
  // Tiny Face Detector (suficiente para detección básica de rostros)
  {
    name: 'tiny_face_detector_model-weights_manifest.json',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json'
  },
  {
    name: 'tiny_face_detector_model-shard1',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1'
  }
];

const download = (url, dest) => new Promise((resolve, reject) => {
  https.get(url, (res) => {
    if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      return resolve(download(res.headers.location, dest));
    }

    if (res.statusCode !== 200) {
      return reject(new Error(`HTTP ${res.statusCode} al descargar ${url}`));
    }

    const chunks = [];
    res.on('data', (c) => chunks.push(c));
    res.on('end', async () => {
      await fs.writeFile(dest, Buffer.concat(chunks));
      resolve();
    });
  }).on('error', reject);
});

await fs.mkdir(MODELS_DIR, { recursive: true });
console.log('📦 Descargando modelos Face-API a:', MODELS_DIR);

for (const f of files) {
  const out = path.join(MODELS_DIR, f.name);
  console.log('  ↓', f.name);
  await download(f.url, out);
}

console.log('✅ Modelos descargados.');
