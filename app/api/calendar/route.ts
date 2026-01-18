import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Google Calendar API 토큰 확인
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // 한국 시간 기준으로 오늘 00:00 ~ 내일 23:59
    const now = new Date();
    const koreaOffset = 9 * 60; // 한국은 UTC+9
    const localOffset = now.getTimezoneOffset(); // 현재 로컬 시간대 오프셋
    const totalOffset = koreaOffset + localOffset;

    // 오늘 00:00 (한국 시간)
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    todayStart.setMinutes(todayStart.getMinutes() - totalOffset);

    // 내일 23:59 (한국 시간)
    const tomorrowEnd = new Date(now);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
    tomorrowEnd.setHours(23, 59, 59, 999);
    tomorrowEnd.setMinutes(tomorrowEnd.getMinutes() - totalOffset);

    console.log('Fetching events from:', todayStart.toISOString(), 'to:', tomorrowEnd.toISOString());

    // Google Calendar API 호출
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?' +
      new URLSearchParams({
        timeMin: todayStart.toISOString(),
        timeMax: tomorrowEnd.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
        timeZone: 'Asia/Seoul',
      }),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Calendar API error response:', errorText);
      throw new Error('Failed to fetch calendar events');
    }

    const data = await response.json();
    console.log(`Found ${data.items?.length || 0} total events`);

    // 이벤트를 Appointment 형식으로 변환 및 필터링
    const appointments = (data.items || [])
      .filter((event: any) => {
        // 출발 시간 일정 제외 (무한 반복 방지)
        // 1. 제목에 🚗 이모지가 포함된 경우
        const isDepartureEvent = event.summary?.includes('🚗') || event.summary?.startsWith('[출발]');
        // 2. location이 없고 description에 "Created by Arrival Assistant"가 있는 경우
        const isCreatedByApp = !event.location && event.description?.includes('Created by Arrival Assistant');

        return !isDepartureEvent && !isCreatedByApp;
      })
      .filter((event: any) => {
        // location이 있는 일정만 포함
        return event.location && event.location.trim() !== '';
      })
      .map((event: any) => ({
        id: event.id,
        title: event.summary || '제목 없음',
        location: event.location || '장소 미정',
        startTime: event.start.dateTime || event.start.date,
        endTime: event.end.dateTime || event.end.date,
        preparationTime: 15, // 기본값
      }));

    console.log(`Filtered ${data.items?.length || 0} events to ${appointments.length} appointments`);

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code required' },
        { status: 400 }
      );
    }

    // OAuth 토큰 교환
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange token');
    }

    const tokens = await tokenResponse.json();

    return NextResponse.json({ tokens });
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate' },
      { status: 500 }
    );
  }
}
