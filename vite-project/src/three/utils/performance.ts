export function getDeviceTier(): 'low' | 'medium' | 'high' {
  const cores = navigator.hardwareConcurrency || 4;
  const memory =
    'deviceMemory' in navigator
      ? ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4)
      : 4;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const saveData =
    'connection' in navigator &&
    Boolean(
      (navigator as Navigator & { connection?: { saveData?: boolean } })
        .connection?.saveData,
    );

  if (saveData || isMobile || cores <= 4 || memory <= 4) {
    return 'low';
  }

  if (cores <= 8 || memory <= 8) {
    return 'medium';
  }

  return 'high';
}

export function starCountForTier(tier: 'low' | 'medium' | 'high'): number {
  switch (tier) {
    case 'low':
      return 120;
    case 'medium':
      return 320;
    case 'high':
      return 560;
  }
}

export function sparkleCountForTier(tier: 'low' | 'medium' | 'high'): number {
  switch (tier) {
    case 'low':
      return 900;
    case 'medium':
      return 2400;
    case 'high':
      return 4200;
  }
}

export function textureSizeForTier(tier: 'low' | 'medium' | 'high'): number {
  switch (tier) {
    case 'low':
      return 512;
    case 'medium':
      return 768;
    case 'high':
      return 1024;
  }
}

export function gridSegmentsForTier(
  tier: 'low' | 'medium' | 'high',
): [number, number] {
  switch (tier) {
    case 'low':
      return [36, 52];
    case 'medium':
      return [55, 80];
    case 'high':
      return [70, 100];
  }
}

export function sphereSegmentsForTier(
  tier: 'low' | 'medium' | 'high',
): [number, number] {
  switch (tier) {
    case 'low':
      return [48, 48];
    case 'medium':
      return [72, 72];
    case 'high':
      return [96, 96];
  }
}

export function dprForTier(tier: 'low' | 'medium' | 'high'): [number, number] {
  switch (tier) {
    case 'low':
      return [1, 1];
    case 'medium':
      return [1, 1.35];
    case 'high':
      return [1, 1.6];
  }
}
