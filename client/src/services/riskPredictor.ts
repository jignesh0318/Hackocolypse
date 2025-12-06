export type WeatherCondition = 'clear' | 'rain' | 'fog' | 'snow' | 'clouds';
export type CrowdLevel = 'low' | 'medium' | 'high';

export interface RiskInputs {
  hour24?: number; // current hour 0-23
  weather?: WeatherCondition;
  crowd?: CrowdLevel;
  isLateForUser?: boolean; // user-specific pattern (e.g., usually home earlier)
}

export interface RiskResult {
  score: number; // 0-100 risk (higher = riskier)
  label: 'LOW' | 'MEDIUM' | 'HIGH';
  factors: string[];
}

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

export function computeRisk(inputs: RiskInputs): RiskResult {
  const hour = inputs.hour24 ?? new Date().getHours();
  const weather = inputs.weather ?? 'clear';
  const crowd = inputs.crowd ?? 'medium';
  const isLate = Boolean(inputs.isLateForUser);

  let score = 40; // baseline
  const factors: string[] = [];

  // Time-based risk
  if (hour >= 23 || hour < 5) {
    score += 25;
    factors.push('Late night');
  } else if (hour >= 20) {
    score += 15;
    factors.push('Evening');
  } else if (hour >= 17) {
    score += 5;
    factors.push('Dusk');
  } else {
    score -= 5;
    factors.push('Daytime');
  }

  // Weather impact
  if (weather === 'rain') {
    score += 10;
    factors.push('Rain');
  } else if (weather === 'fog') {
    score += 12;
    factors.push('Fog/low visibility');
  } else if (weather === 'snow') {
    score += 8;
    factors.push('Snow');
  } else if (weather === 'clouds') {
    score += 2;
    factors.push('Cloudy');
  } else {
    factors.push('Clear');
  }

  // Crowd density
  if (crowd === 'high') {
    score -= 10;
    factors.push('Crowd present');
  } else if (crowd === 'low') {
    score += 10;
    factors.push('Low crowd');
  } else {
    factors.push('Medium crowd');
  }

  // Personal behavior
  if (isLate) {
    score += 8;
    factors.push('Later than usual');
  }

  const finalScore = clamp(Math.round(score));
  let label: RiskResult['label'] = 'LOW';
  if (finalScore >= 70) label = 'HIGH';
  else if (finalScore >= 45) label = 'MEDIUM';

  return { score: finalScore, label, factors };
}

// Simple crowd heuristic by time of day (fallback if no data)
export function estimateCrowdByHour(hour: number): CrowdLevel {
  if (hour >= 8 && hour <= 10) return 'high';
  if (hour >= 17 && hour <= 20) return 'high';
  if (hour >= 11 && hour <= 16) return 'medium';
  return 'low';
}
