import * as THREE from 'three';

function hash(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function noise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  return (
    hash(xi, yi) * (1 - u) * (1 - v) +
    hash(xi + 1, yi) * u * (1 - v) +
    hash(xi, yi + 1) * (1 - u) * v +
    hash(xi + 1, yi + 1) * u * v
  );
}

function fbm(x: number, y: number) {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < 5; i += 1) {
    value += amp * noise(x * freq, y * freq);
    amp *= 0.5;
    freq *= 2.05;
  }
  return value;
}

export type NebulaTint = 'teal' | 'violet' | 'magenta' | 'crimson';

const TINTS: Record<NebulaTint, [number, number, number]> = {
  teal: [40, 180, 200],
  violet: [140, 80, 220],
  magenta: [210, 70, 180],
  crimson: [220, 70, 90],
};

/** Soft wispy gas sprite for contact nebula layers. */
export function createNebulaSprite(
  tint: NebulaTint,
  size = 512,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const image = ctx.createImageData(size, size);
  const [tr, tg, tb] = TINTS[tint];
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.48;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (x - cx) / maxR;
      const dy = (y - cy) / maxR;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const i = (y * size + x) * 4;
      if (dist > 1) {
        image.data[i + 3] = 0;
        continue;
      }

      const u = x / size;
      const v = y / size;
      const n = fbm(u * 4.5 + 1.2, v * 3.8 + 0.7);
      const filament = fbm(u * 9 + 3, v * 7 + 2);
      const falloff = Math.pow(1 - dist, 1.6);
      const density = Math.max(0, n * 0.65 + filament * 0.45 - 0.18) * falloff;
      const glow = Math.pow(density, 0.85);

      image.data[i] = Math.min(255, Math.floor(tr * (0.55 + glow * 0.7)));
      image.data[i + 1] = Math.min(255, Math.floor(tg * (0.5 + glow * 0.65)));
      image.data[i + 2] = Math.min(255, Math.floor(tb * (0.55 + glow * 0.7)));
      image.data[i + 3] = Math.floor(glow * 210);
    }
  }

  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
