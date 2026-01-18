import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      accessToken,
      originalEventId,
      departureTime,
      destination,
      originalEventStart
    } = body;

    if (!accessToken || !departureTime || !destination || !originalEventStart) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 출발 시간 일정 생성
    const event = {
      summary: `🚗 ${destination} 출발`,
      description: `${destination} 약속을 위한 출발 시간입니다.\n\nCreated by Arrival Assistant`,
      start: {
        dateTime: departureTime,
        timeZone: 'Asia/Seoul',
      },
      end: {
        dateTime: originalEventStart,
        timeZone: 'Asia/Seoul',
      },
      // location 필드를 비워둠 (필터링용)
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 10 },
        ],
      },
      colorId: '9', // 파란색으로 구분
    };

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Google Calendar API error:', error);
      return NextResponse.json(
        { error: 'Failed to create calendar event', details: error },
        { status: response.status }
      );
    }

    const createdEvent = await response.json();
    return NextResponse.json({
      success: true,
      eventId: createdEvent.id,
      eventLink: createdEvent.htmlLink
    });
  } catch (error) {
    console.error('Add departure event error:', error);
    return NextResponse.json(
      { error: 'Failed to add departure event' },
      { status: 500 }
    );
  }
}
