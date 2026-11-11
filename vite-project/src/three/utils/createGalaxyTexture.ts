import * as THREE from 'three';

function hash(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
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

function smoothEdge(t: number, soft = 0.22) {
  // Soft fade near 0 and 1 so the plane dissolves into space
  const a = Math.min(1, t / soft);
  const b = Math.min(1, (1 - t) / soft);
  return Math.max(0, Math.min(a, b));
}

/** Soft rectangular galaxy band — edges feather to transparent (no hard crop). */
export function createGalaxyTexture(width = 2048, height = 1024): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(width, height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const u = x / width;
      const v = y / height;
      const dx = u - 0.5;
      const dy = (v - 0.5) * 1.85;

      const angle = Math.atan2(dy, dx);
      const radius = Math.sqrt(dx * dx + dy * dy);
      const arm = Math.sin(angle * 2.4 + radius * 12) * 0.07;
      const band = Math.exp(-Math.pow((dy - arm) * 2.8, 2));
      const dust = fbm(u * 7, v * 7);
      const core = Math.exp(-radius * radius * 5.5);
      const stars = Math.pow(hash(x * 0.37, y * 0.91), 30);

      const density = band * (0.4 + dust * 0.85) + core * 0.7 + stars;

      const r = Math.min(
        255,
        Math.floor(density * (130 + core * 80 + band * 60) + stars * 255),
      );
      const g = Math.min(
        255,
        Math.floor(density * (85 + core * 50 + dust * 35) + stars * 220),
      );
      const b = Math.min(
        255,
        Math.floor(density * (150 + (1 - core) * 70 + band * 40) + stars * 255),
      );

      // Feather all four edges + a soft elliptical falloff
      const edge = smoothEdge(u, 0.28) * smoothEdge(v, 0.3);
      const ellipse = Math.exp(-(dx * dx * 2.8 + dy * dy * 3.4));
      const a = Math.min(255, Math.floor(density * edge * ellipse * 255));

      const i = (y * width + x) * 4;
      img.data[i] = r;
      img.data[i + 1] = g;
      img.data[i + 2] = b;
      img.data[i + 3] = a;
    }
  }

  ctx.putImageData(img, 0, 0);

  for (let i = 0; i < 1600; i += 1) {
    const sx = Math.random() * width;
    const sy = height * 0.2 + Math.random() * height * 0.6;
    const u = sx / width;
    const v = sy / height;
    const edge = smoothEdge(u, 0.28) * smoothEdge(v, 0.3);
    if (edge < 0.35) continue;
    const radius = Math.random() > 0.92 ? 1.5 : 0.6;
    ctx.fillStyle =
      Math.random() > 0.7
        ? `rgba(253,230,138,${0.7 * edge})`
        : Math.random() > 0.5
          ? `rgba(249,168,212,${0.65 * edge})`
          : `rgba(255,255,255,${0.85 * edge})`;
    ctx.beginPath();
    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}
