import type { CalendarEvent, Appointment } from '../types';

// Access token 갱신 함수
async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = localStorage.getItem('google_refresh_token');

    if (!refreshToken) {
      console.error('No refresh token available');
      return null;
    }

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      console.error('Failed to refresh access token');
      return null;
    }

    const data = await response.json();
    const newAccessToken = data.access_token;

    // 새 토큰을 localStorage에 저장
    localStorage.setItem('google_access_token', newAccessToken);

    console.log('Access token refreshed successfully');
    return newAccessToken;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return null;
  }
}

export async function fetchCalendarEvents(accessToken: string): Promise<CalendarEvent[]> {
  try {
    let token = accessToken;
    let response = await fetch('/api/calendar', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // 401 에러 시 토큰 갱신 후 재시도
    if (response.status === 401) {
      console.log('Access token expired, refreshing...');
      const newToken = await refreshAccessToken();

      if (!newToken) {
        throw new Error('Failed to refresh access token');
      }

      // 새 토큰으로 재시도
      token = newToken;
      response = await fetch('/api/calendar', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    if (!response.ok) {
      throw new Error('Failed to fetch calendar events');
    }

    const data = await response.json();
    return data.appointments;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}

export function convertCalendarEventToAppointment(
  event: CalendarEvent,
  defaultPrepTime: number = 15
): Appointment {
  return {
    id: event.id,
    title: event.summary,
    location: event.location || '장소 미정',
    startTime: event.start.dateTime,
    endTime: event.end.dateTime,
    preparationTime: defaultPrepTime,
  };
}

export async function authenticateGoogleCalendar(): Promise<string | null> {
  try {
    // Google OAuth URL 생성
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/auth/callback`;
    const scope = 'https://www.googleapis.com/auth/calendar.readonly';

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId || '');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');

    // 새 창에서 OAuth 플로우 시작
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      authUrl.toString(),
      'Google Calendar 인증',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // 팝업에서 인증 완료를 기다림
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        try {
          if (popup?.closed) {
            clearInterval(interval);
            // localStorage에서 토큰 확인
            const token = localStorage.getItem('google_access_token');
            resolve(token);
          }
        } catch (error) {
          // Cross-origin 오류 무시
        }
      }, 500);
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}
