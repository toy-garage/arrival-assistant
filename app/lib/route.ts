import type { RouteInfo } from '../types';

export async function calculateRoute(
  origin: string,
  destination: string
): Promise<RouteInfo | null> {
  try {
    const response = await fetch('/api/route/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origin,
        destination,
        departureTime: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to calculate route');
    }

    const data = await response.json();

    return {
      duration: data.duration,
      distance: data.distance,
      departureTime: '', // 계산 필요
      arrivalTime: '', // 계산 필요
      path: data.path || [],
      trafficInfo: data.trafficInfo,
    };
  } catch (error) {
    console.error('Route calculation error:', error);
    return null;
  }
}

export function calculateDepartureTime(
  appointmentTime: Date,
  travelDuration: number,
  preparationTime: number,
  earlyArrivalMinutes: number = 5
): Date {
  // 약속 시간 - 5분(일찍 도착) - 이동 시간 - 준비 시간
  const totalMinutes = earlyArrivalMinutes + travelDuration + preparationTime;
  const departureTime = new Date(appointmentTime.getTime() - totalMinutes * 60 * 1000);

  return departureTime;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}시간 ${mins}분`;
  }
  return `${mins}분`;
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${meters}m`;
}
