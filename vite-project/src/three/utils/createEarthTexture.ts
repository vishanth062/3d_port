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
    amp *= 0.52;
    freq *= 2.05;
  }
  return value;
}

export interface EarthMaps {
  color: THREE.CanvasTexture;
  emissive: THREE.CanvasTexture;
}

export type WarmPlanetTint =
  'ember' | 'copper' | 'amber' | 'bronze' | 'rust' | 'ocean' | 'volcanic' | 'ice';

const TINTS: Record<
  WarmPlanetTint,
  {
    land: [number, number, number];
    sea: [number, number, number];
    glow: [number, number, number];
  }
> = {
  ember: {
    land: [42, 24, 16],
    sea: [18, 12, 10],
    glow: [255, 140, 50],
  },
  copper: {
    land: [48, 28, 18],
    sea: [22, 14, 12],
    glow: [232, 160, 90],
  },
  amber: {
    land: [38, 26, 14],
    sea: [16, 12, 10],
    glow: [251, 191, 36],
  },
  bronze: {
    land: [44, 30, 18],
    sea: [20, 14, 11],
    glow: [212, 150, 70],
  },
  rust: {
    land: [52, 22, 16],
    sea: [24, 12, 12],
    glow: [245, 120, 60],
  },
  ocean: {
    land: [148, 198, 132],
    sea: [12, 28, 72],
    glow: [120, 220, 200],
  },
  volcanic: {
    land: [118, 92, 58],
    sea: [18, 22, 48],
    glow: [255, 120, 48],
  },
  ice: {
    land: [188, 210, 220],
    sea: [48, 92, 138],
    glow: [170, 230, 255],
  },
};

/** Dark-warm planet maps (espresso / umber / bronze) + gold city lights. */
export function createEarthMaps(size = 768, tint: WarmPlanetTint = 'amber'): EarthMaps {
  const palette = TINTS[tint];
  const colorCanvas = document.createElement('canvas');
  const emitCanvas = document.createElement('canvas');
  colorCanvas.width = emitCanvas.width = size;
  colorCanvas.height = emitCanvas.height = size;
  const cctx = colorCanvas.getContext('2d')!;
  const ectx = emitCanvas.getContext('2d')!;
  const colorImg = cctx.createImageData(size, size);
  const emitImg = ectx.createImageData(size, size);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const v = y / size;
      const n = fbm(u * 5.5, v * 3.2);
      const continent = n > 0.48;
      const coast = Math.abs(n - 0.48) < 0.035;
      const cloud = fbm(u * 9 + 4, v * 6 + 2);
      const ridge = fbm(u * 12, v * 8);

      const polar = Math.pow(Math.max(0, Math.abs(v * 2 - 1) - 0.62) / 0.38, 1.35);
      let r: number;
      let g: number;
      let b: number;
      if (continent) {
        if (tint === 'ocean') {
          // Light green lands with soft terrain variation
          const lift = (n - 0.48) * 90 + ridge * 35 + cloud * 18;
          r = Math.min(255, Math.floor(palette.land[0] + lift * 0.35 - ridge * 20));
          g = Math.min(255, Math.floor(palette.land[1] + lift * 0.55));
          b = Math.min(255, Math.floor(palette.land[2] + lift * 0.25 - ridge * 15));
          if (coast) {
            r = Math.floor(r * 0.55 + 40);
            g = Math.floor(g * 0.65 + 90);
            b = Math.floor(b * 0.55 + 110);
          }
        } else if (tint === 'volcanic') {
          // Ash-olive continents with ember ridges / warm coasts
          const lift = (n - 0.48) * 70 + ridge * 40 + cloud * 12;
          const heat = Math.max(0, ridge - 0.55) * 1.8;
          r = Math.min(255, Math.floor(palette.land[0] + lift * 0.4 + heat * 90));
          g = Math.min(255, Math.floor(palette.land[1] + lift * 0.25 - heat * 20));
          b = Math.min(255, Math.floor(palette.land[2] + lift * 0.12 - heat * 30));
          if (coast) {
            r = Math.floor(r * 0.55 + 90);
            g = Math.floor(g * 0.45 + 40);
            b = Math.floor(b * 0.4 + 20);
          }
        } else if (tint === 'ice') {
          // Frosted pale land + strong polar caps
          const lift = (n - 0.48) * 50 + ridge * 18 + cloud * 22;
          r = Math.min(255, Math.floor(palette.land[0] + lift * 0.35 + polar * 55));
          g = Math.min(255, Math.floor(palette.land[1] + lift * 0.4 + polar * 40));
          b = Math.min(255, Math.floor(palette.land[2] + lift * 0.45 + polar * 35));
          if (coast) {
            r = Math.floor(r * 0.7 + 70);
            g = Math.floor(g * 0.75 + 85);
            b = Math.floor(b * 0.8 + 100);
          }
        } else {
          // Dark warm land — charcoal umber / espresso
          const lift = n * 55 + ridge * 25 + cloud * 12;
          r = Math.min(255, Math.floor(palette.land[0] + lift));
          g = Math.min(255, Math.floor(palette.land[1] + lift * 0.55));
          b = Math.min(255, Math.floor(palette.land[2] + lift * 0.28));
          if (coast) {
            r = Math.floor(r * 0.75 + 30);
            g = Math.floor(g * 0.7 + 18);
            b = Math.floor(b * 0.65 + 10);
          }
        }
      } else if (tint === 'ocean') {
        // Dark blue seas — layered shades (deep / mid / shelf)
        const deep = fbm(u * 3.2 + 1.4, v * 2.4 + 0.8);
        const shelf = Math.max(0, 0.52 - n) * 1.8;
        r = Math.floor(6 + deep * 14 + n * 10 + shelf * 18 + cloud * 6);
        g = Math.floor(16 + deep * 28 + n * 22 + shelf * 40 + cloud * 10);
        b = Math.floor(48 + deep * 55 + n * 40 + shelf * 50 + cloud * 12);
      } else if (tint === 'volcanic') {
        const deep = fbm(u * 3.2 + 1.4, v * 2.4 + 0.8);
        r = Math.floor(10 + deep * 18 + n * 12 + cloud * 8);
        g = Math.floor(14 + deep * 20 + n * 14 + cloud * 6);
        b = Math.floor(36 + deep * 40 + n * 28 + cloud * 10);
      } else if (tint === 'ice') {
        const deep = fbm(u * 3.2 + 1.4, v * 2.4 + 0.8);
        const shelf = Math.max(0, 0.52 - n) * 1.8;
        r = Math.floor(28 + deep * 30 + n * 18 + shelf * 40 + polar * 90 + cloud * 10);
        g = Math.floor(70 + deep * 40 + n * 24 + shelf * 45 + polar * 70 + cloud * 12);
        b = Math.floor(110 + deep * 50 + n * 30 + shelf * 40 + polar * 50 + cloud * 14);
      } else {
        // Dark warm seas — nearly black with a bronze hint
        r = Math.floor(palette.sea[0] + n * 18 + cloud * 8);
        g = Math.floor(palette.sea[1] + n * 12 + cloud * 6);
        b = Math.floor(palette.sea[2] + n * 10 + cloud * 5);
      }

      const night = Math.pow(Math.max(0, 0.58 - u), 1.35);
      const i = (y * size + x) * 4;
      colorImg.data[i] = r;
      colorImg.data[i + 1] = g;
      colorImg.data[i + 2] = b;
      colorImg.data[i + 3] = 255;

      const gridU = Math.abs(Math.sin(u * Math.PI * 48));
      const gridV = Math.abs(Math.sin(v * Math.PI * 28));
      const network =
        continent && (gridU > 0.92 || gridV > 0.94 || hash(x * 0.7, y * 1.1) > 0.985);
      let glow = network ? night * (0.6 + hash(x, y) * 0.4) : 0;
      if (tint === 'volcanic') {
        const vent =
          continent && ridge > 0.62 ? (ridge - 0.62) * 2.4 * (0.35 + night) : 0;
        glow = Math.min(1, glow * 0.55 + vent);
      } else if (tint === 'ice') {
        glow = network ? night * 0.35 : polar * 0.22;
      }

      emitImg.data[i] = Math.floor(palette.glow[0] * glow);
      emitImg.data[i + 1] = Math.floor(palette.glow[1] * glow);
      emitImg.data[i + 2] = Math.floor(palette.glow[2] * glow);
      emitImg.data[i + 3] = 255;
    }
  }

  cctx.putImageData(colorImg, 0, 0);
  ectx.putImageData(emitImg, 0, 0);

  ectx.strokeStyle = `rgba(${palette.glow[0]}, ${palette.glow[1]}, ${palette.glow[2]}, 0.5)`;
  ectx.lineWidth = 1.15;
  for (let k = 0; k < 14; k += 1) {
    ectx.beginPath();
    const y0 = size * (0.15 + Math.random() * 0.7);
    ectx.moveTo(0, y0);
    for (let x = 0; x < size; x += 24) {
      ectx.lineTo(x, y0 + Math.sin(x * 0.02 + k) * 28);
    }
    ectx.stroke();
  }

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
