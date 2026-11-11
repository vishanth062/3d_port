export function getDeviceTier(): 'low' | 'medium' | 'high' {
  const cores = navigator.hardwareConcurrency || 4;
  const memory =
    'deviceMemory' in navigator
      ? ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4)
      : 4;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  if (isMobile || cores <= 4 || memory <= 4) {
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
      return 180;
    case 'medium':
      return 420;
    case 'high':
      return 700;
  }
}
