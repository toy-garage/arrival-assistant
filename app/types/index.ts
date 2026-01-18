export interface Appointment {
  id: string;
  title: string;
  location: string;
  startTime: string;
  endTime: string;
  departureTime?: string;
  travelDuration?: number;
  preparationTime: number;
  routeDetails?: RouteDetails;
}

export interface RouteDetails {
  transportMode: 'driving' | 'transit' | 'walking';
  steps?: RouteStep[];
  summary: string;
  distance: number;
  duration: number;
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  transportType?: 'subway' | 'bus' | 'walk' | 'car';
  lineInfo?: {
    name: string;
    color?: string;
  };
}

export interface RouteInfo {
  duration: number; // 분 단위
  distance: number; // 미터 단위
  departureTime: string;
  arrivalTime: string;
  path: [number, number][]; // 경로 좌표
  trafficInfo?: {
    congestion: 'smooth' | 'normal' | 'slow' | 'blocked';
    realTimeDuration: number;
  };
}

export interface CalendarEvent {
  id: string;
  summary: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
}

export interface UserSettings {
  homeAddress: string;
  defaultPrepTime: number;
  notificationsEnabled: boolean;
  calendarConnected: boolean;
}

export interface FavoriteLocation {
  id: string;
  name: string;
  address: string;
  icon: string; // 이모지 아이콘
  category: 'home' | 'work' | 'cafe' | 'school' | 'gym' | 'restaurant' | 'other';
  createdAt: string;
}
