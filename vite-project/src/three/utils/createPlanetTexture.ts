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
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

function fbm(x: number, y: number) {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < 5; i += 1) {
    value += amp * noise(x * freq, y * freq);
    amp *= 0.5;
    freq *= 2;
  }
  return value;
}

/** Procedural gas/ice planet map for the orbital core. */
export function createOrbitalPlanetTexture(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const image = ctx.createImageData(size, size);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const v = y / size;
      const n = fbm(u * 6, v * 4);
      const bands = 0.55 + 0.45 * Math.sin(v * Math.PI * 10 + n * 3.5);
      const storm = Math.pow(Math.max(0, fbm(u * 10 + 20, v * 8) - 0.55), 1.6);

      const r = Math.floor(90 + bands * 110 + storm * 80);
      const g = Math.floor(70 + bands * 70 + storm * 40);
      const b = Math.floor(140 + bands * 90 + (1 - storm) * 40);

      const i = (y * size + x) * 4;
      image.data[i] = Math.min(255, r);
      image.data[i + 1] = Math.min(255, g);
      image.data[i + 2] = Math.min(255, b);
      image.data[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export type ProjectPlanetStyle =
  | 'volcanic'
  | 'gasband'
  | 'cratered'
  | 'storm';

export interface ProjectPlanetMaps {
  color: THREE.CanvasTexture;
  emissive: THREE.CanvasTexture;
}

/** Distinct procedural surfaces so project worlds don't clone each other. */
export function createProjectPlanetMaps(
  style: ProjectPlanetStyle,
  seed = 0,
  size = 512,
): ProjectPlanetMaps {
  const colorCanvas = document.createElement('canvas');
  const emitCanvas = document.createElement('canvas');
  colorCanvas.width = emitCanvas.width = size;
  colorCanvas.height = emitCanvas.height = size;
  const cctx = colorCanvas.getContext('2d')!;
  const ectx = emitCanvas.getContext('2d')!;
  const colorImg = cctx.createImageData(size, size);
  const emitImg = ectx.createImageData(size, size);
  const ox = seed * 17.3;
  const oy = seed * 9.1;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const v = y / size;
      const i = (y * size + x) * 4;
      let r = 0;
      let g = 0;
      let b = 0;
      let er = 0;
      let eg = 0;
      let eb = 0;

      if (style === 'volcanic') {
        const n = fbm(u * 7 + ox, v * 5 + oy);
        const cracks = Math.pow(Math.max(0, 0.62 - fbm(u * 14 + ox, v * 11 + oy)), 2.4);
        r = Math.floor(18 + n * 28 + cracks * 160);
        g = Math.floor(10 + n * 14 + cracks * 55);
        b = Math.floor(8 + n * 10 + cracks * 20);
        er = Math.floor(cracks * 255);
        eg = Math.floor(cracks * 110);
        eb = Math.floor(cracks * 30);
      } else if (style === 'gasband') {
        const n = fbm(u * 4 + ox, v * 18 + oy);
        const bands = 0.5 + 0.5 * Math.sin(v * Math.PI * 14 + n * 4 + seed);
        const storm = Math.pow(Math.max(0, fbm(u * 9 + ox, v * 7 + oy) - 0.58), 1.5);
        const palettes = [
          [
            [90, 48, 28],
            [140, 85, 40],
            [60, 32, 22],
          ],
          [
            [70, 40, 55],
            [120, 70, 90],
            [45, 25, 40],
          ],
          [
            [55, 45, 30],
            [110, 95, 50],
            [35, 28, 18],
          ],
        ] as const;
        const pal = palettes[seed % palettes.length]!;
        const a = pal[0]!;
        const c = pal[1]!;
        const d = pal[2]!;
        const mix = bands;
        r = Math.floor(a[0]! * (1 - mix) + c[0]! * mix + storm * 70 + d[0]! * 0.15);
        g = Math.floor(a[1]! * (1 - mix) + c[1]! * mix + storm * 35 + d[1]! * 0.15);
        b = Math.floor(a[2]! * (1 - mix) + c[2]! * mix + storm * 25 + d[2]! * 0.15);
        er = Math.floor(storm * 200 + bands * 40);
        eg = Math.floor(storm * 120 + bands * 25);
        eb = Math.floor(storm * 60);
      } else if (style === 'cratered') {
        const n = fbm(u * 6 + ox, v * 6 + oy);
        const crater =
          Math.pow(Math.max(0, 0.55 - Math.abs(fbm(u * 10 + ox, v * 10 + oy) - 0.42)), 1.8) *
          (hash(x * 0.3 + seed, y * 0.3) > 0.55 ? 1 : 0.15);
        r = Math.floor(42 + n * 55 - crater * 35);
        g = Math.floor(36 + n * 40 - crater * 28);
        b = Math.floor(32 + n * 30 - crater * 22);
        const spark = crater > 0.35 && hash(x + seed, y) > 0.97 ? 1 : 0;
        er = Math.floor(spark * 220);
        eg = Math.floor(spark * 170);
        eb = Math.floor(spark * 80);
      } else {
        // storm — spiral eye + violet-gold swirl
        const dx = u - 0.5;
        const dy = (v - 0.5) * 1.15;
        const ang = Math.atan2(dy, dx) + fbm(u * 5 + ox, v * 5 + oy) * 2.5;
        const rad = Math.sqrt(dx * dx + dy * dy);
        const spiral = 0.5 + 0.5 * Math.sin(ang * 3 + rad * 18 + seed);
        const eye = Math.pow(Math.max(0, 1 - rad * 3.2), 2.2);
        const n = fbm(u * 8 + ox, v * 6 + oy);
        r = Math.floor(35 + spiral * 55 + eye * 90 + n * 25);
        g = Math.floor(18 + spiral * 30 + eye * 40 + n * 15);
        b = Math.floor(55 + spiral * 70 + eye * 20 + n * 35);
        er = Math.floor(eye * 180 + spiral * 50);
        eg = Math.floor(eye * 90 + spiral * 30);
        eb = Math.floor(eye * 220 + spiral * 70);
      }

      colorImg.data[i] = Math.min(255, r);
      colorImg.data[i + 1] = Math.min(255, g);
      colorImg.data[i + 2] = Math.min(255, b);
      colorImg.data[i + 3] = 255;
      emitImg.data[i] = Math.min(255, er);
      emitImg.data[i + 1] = Math.min(255, eg);
      emitImg.data[i + 2] = Math.min(255, eb);
      emitImg.data[i + 3] = 255;
    }
  }

  cctx.putImageData(colorImg, 0, 0);
  ectx.putImageData(emitImg, 0, 0);

  const color = new THREE.CanvasTexture(colorCanvas);
  const emissive = new THREE.CanvasTexture(emitCanvas);
  color.colorSpace = THREE.SRGBColorSpace;
  emissive.colorSpace = THREE.SRGBColorSpace;
  color.anisotropy = 8;
  emissive.anisotropy = 8;
  color.needsUpdate = true;
  emissive.needsUpdate = true;
  return { color, emissive };
}

/**
 * Cinematic Saturn body — warm cream/orange bands on the lit face,
 * deep teal-blue night side (matches the close-up reference).
 */
export function createSaturnTexture(size = 1024): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const image = ctx.createImageData(size, size);

  const bandColors = [
    [255, 210, 150],
    [236, 170, 105],
    [210, 140, 78],
    [248, 200, 140],
    [190, 120, 70],
    [255, 220, 170],
    [168, 105, 62],
    [230, 175, 115],
    [200, 135, 80],
    [245, 195, 135],
  ];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const v = y / size;
      const u = x / size;
      const bands = bandColors.length;
      const scaled = v * bands;
      const bandIndex = Math.min(bands - 1, Math.floor(scaled));
      const next = Math.min(bands - 1, bandIndex + 1);
      const t = scaled - bandIndex;
      const n = fbm(u * 5, v * 26);
      const swirl = fbm(u * 9 + 2, v * 7 + 1);
      const wobble = (n - 0.5) * 0.4;
      const mix = Math.min(1, Math.max(0, t + wobble));
      const c0 = bandColors[bandIndex]!;
      const c1 = bandColors[next]!;
      const storm = Math.pow(Math.max(0, swirl - 0.6), 1.5);

      let r = c0[0]! * (1 - mix) + c1[0]! * mix + storm * 35;
      let g = c0[1]! * (1 - mix) + c1[1]! * mix + storm * 18;
      let b = c0[2]! * (1 - mix) + c1[2]! * mix + storm * 8;

      // Night / shadowed hemisphere → deep teal-blue
      const night = Math.pow(Math.max(0, 0.52 - u), 1.15);
      const polar = Math.pow(Math.max(0, 0.38 - v), 1.4);
      const shade = Math.min(1, night * 1.35 + polar * 0.85);
      r = r * (1 - shade) + 8 * shade;
      g = g * (1 - shade) + 28 * shade;
      b = b * (1 - shade) + 58 * shade;

      // Bright limb glow near the lit equator edge
      const limb = Math.pow(1 - Math.abs(u - 0.62) * 2.4, 3) * (1 - shade);
      if (limb > 0) {
        r = Math.min(255, r + limb * 70);
        g = Math.min(255, g + limb * 45);
        b = Math.min(255, b + limb * 20);
      }

      const i = (y * size + x) * 4;
      image.data[i] = Math.min(255, Math.floor(r));
      image.data[i + 1] = Math.min(255, Math.floor(g));
      image.data[i + 2] = Math.min(255, Math.floor(b));
      image.data[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

/** Dense gold/copper rings with fine concentric lines + sparkle flecks. */
export function createSaturnRingTexture(size = 1024): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const image = ctx.createImageData(size, size);
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) / maxR;
      const i = (y * size + x) * 4;
      if (dist < 0.38 || dist > 0.99) {
        image.data[i + 3] = 0;
        continue;
      }

      const ang = Math.atan2(dy, dx);
      const n = noise(dist * 90, ang * 4 + 2);
      const fine = 0.5 + 0.5 * Math.sin(dist * Math.PI * 110 + n * 3.5);
      const mid = 0.5 + 0.5 * Math.sin(dist * Math.PI * 36 + n);

      // Cassini / Encke style gaps
      const gap =
        (dist > 0.55 && dist < 0.575) ||
        (dist > 0.72 && dist < 0.735) ||
        (dist > 0.86 && dist < 0.875);
      if (gap) {
        image.data[i + 3] = 0;
        continue;
      }

      // Inner rings hotter / brighter gold-orange
      const inner = Math.pow(Math.max(0, 1 - (dist - 0.38) / 0.35), 1.6);
      const copper = 140 + fine * 70 + mid * 40;
      const r = Math.min(255, copper + inner * 90);
      const g = Math.min(255, copper * 0.72 + inner * 45 + fine * 20);
      const b = Math.min(255, copper * 0.38 + fine * 10);

      // Sparse ice sparkles
      const spark = hash(x * 1.7, y * 2.3) > 0.992 ? 1 : 0;

      image.data[i] = Math.min(255, Math.floor(r + spark * 80));
      image.data[i + 1] = Math.min(255, Math.floor(g + spark * 70));
      image.data[i + 2] = Math.min(255, Math.floor(b + spark * 40));
      image.data[i + 3] = Math.floor(
        55 + fine * 100 + mid * 50 + inner * 60 + spark * 80,
      );
    }
  }

  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Holographic tech sphere — cyan grid, data points, hex storm eye
 * (matches the mechanical armillary reference).
 */
export function createArmillarySphereTexture(size = 1024): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(
    size * 0.5,
    size * 0.42,
    size * 0.05,
    size * 0.5,
    size * 0.5,
    size * 0.55,
  );
  grad.addColorStop(0, '#7dd3fc');
  grad.addColorStop(0.25, '#2563eb');
  grad.addColorStop(0.55, '#0b1f4a');
  grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const image = ctx.getImageData(0, 0, size, size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const v = y / size;
      const n = fbm(u * 8, v * 6);
      const i = (y * size + x) * 4;
      image.data[i] = Math.min(255, image.data[i]! + Math.floor(n * 18));
      image.data[i + 1] = Math.min(255, image.data[i + 1]! + Math.floor(n * 28));
      image.data[i + 2] = Math.min(255, image.data[i + 2]! + Math.floor(n * 40));
    }
  }
  ctx.putImageData(image, 0, 0);

  // Fine data grid
  ctx.strokeStyle = 'rgba(125, 211, 252, 0.28)';
  ctx.lineWidth = 1;
  const step = size / 48;
  for (let g = 0; g <= 48; g += 1) {
    const p = g * step;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(size, p);
    ctx.stroke();
  }

  // Hexagonal storm eye (Saturn north-pole style)
  const cx = size * 0.5;
  const cy = size * 0.42;
  const hexR = size * 0.16;
  for (let ring = 1; ring <= 5; ring += 1) {
    const r = hexR * (ring / 5);
    ctx.beginPath();
    for (let k = 0; k < 6; k += 1) {
      const a = (Math.PI / 3) * k - Math.PI / 6;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = `rgba(186, 230, 253, ${0.85 - ring * 0.1})`;
    ctx.lineWidth = ring === 1 ? 2.4 : 1.2;
    ctx.stroke();
  }
  // Inner hex spokes
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
  ctx.lineWidth = 1;
  for (let k = 0; k < 6; k += 1) {
    const a = (Math.PI / 3) * k - Math.PI / 6;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * hexR, cy + Math.sin(a) * hexR);
    ctx.stroke();
  }

  // Data points
  for (let k = 0; k < 380; k += 1) {
    const sx = Math.random() * size;
    const sy = Math.random() * size;
    const bright = 140 + Math.random() * 115;
    ctx.fillStyle = `rgba(${bright * 0.55},${bright * 0.85},${bright},${0.35 + Math.random() * 0.55})`;
    ctx.fillRect(sx, sy, 1.2 + Math.random(), 1.2 + Math.random());
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

/** Soft emissive companion for the holographic sphere. */
export function createArmillaryEmissiveTexture(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);

  const cx = size * 0.5;
  const cy = size * 0.42;
  const glow = ctx.createRadialGradient(cx, cy, 2, cx, cy, size * 0.22);
  glow.addColorStop(0, 'rgba(186,230,253,1)');
  glow.addColorStop(0.4, 'rgba(56,189,248,0.7)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = 'rgba(125,211,252,0.55)';
  ctx.lineWidth = 1;
  for (let g = 0; g < 24; g += 1) {
    const p = (g / 24) * size;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, size);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/** Brushed metal strip map for armillary torus rings (gold / blue / stipple). */
export function createArmillaryRingTexture(
  kind: 'gold' | 'blue' | 'stipple' = 'gold',
  size = 512,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const image = ctx.createImageData(size, size);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const v = y / size;
      const brush = noise(u * 40, v * 6);
      const band = 0.5 + 0.5 * Math.sin(v * Math.PI * 18 + brush * 2);
      const i = (y * size + x) * 4;
      let r: number;
      let g: number;
      let b: number;
      let a = 255;

      if (kind === 'gold') {
        r = Math.floor(150 + band * 90 + brush * 40);
        g = Math.floor(110 + band * 70 + brush * 25);
        b = Math.floor(40 + band * 35 + brush * 15);
      } else if (kind === 'blue') {
        r = Math.floor(20 + band * 35 + brush * 20);
        g = Math.floor(55 + band * 70 + brush * 30);
        b = Math.floor(90 + band * 120 + brush * 40);
      } else {
        const dot = hash(x * 0.9, y * 1.1);
        const dense = dot > 0.55 ? 1 : 0;
        r = Math.floor(25 + dense * 40 + band * 30);
        g = Math.floor(50 + dense * 70 + band * 40);
        b = Math.floor(95 + dense * 120 + band * 50);
        a = Math.floor(dense ? 200 + brush * 55 : 30 + band * 40);
      }

      image.data[i] = Math.min(255, r);
      image.data[i + 1] = Math.min(255, g);
      image.data[i + 2] = Math.min(255, b);
      image.data[i + 3] = a;
    }
  }

  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(kind === 'stipple' ? 6 : 4, 1);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}
