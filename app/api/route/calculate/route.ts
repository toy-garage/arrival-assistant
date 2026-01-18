import { NextRequest, NextResponse } from 'next/server';

interface RouteRequest {
  origin: string;
  destination: string;
  departureTime?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RouteRequest = await request.json();
    const { origin, destination, departureTime } = body;

    console.log(`Route calculation request: ${origin} → ${destination}`);

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      );
    }

    const naverClientId = process.env.NAVER_CLIENT_ID;
    const naverClientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!naverClientId || !naverClientSecret) {
      console.error('Naver API credentials not configured');
      return NextResponse.json(
        { error: 'Naver API credentials not configured' },
        { status: 500 }
      );
    }

    // 먼저 주소를 좌표로 변환 (Geocoding)
    console.log(`Geocoding origin: ${origin}`);
    const geocodeOrigin = await geocodeAddress(origin, naverClientId, naverClientSecret);

    console.log(`Geocoding destination: ${destination}`);
    const geocodeDestination = await geocodeAddress(destination, naverClientId, naverClientSecret);

    if (!geocodeOrigin) {
      console.error(`Failed to geocode origin: ${origin}`);
      return NextResponse.json(
        { error: `주소를 찾을 수 없습니다: ${origin}` },
        { status: 400 }
      );
    }

    if (!geocodeDestination) {
      console.error(`Failed to geocode destination: ${destination}`);
      return NextResponse.json(
        { error: `주소를 찾을 수 없습니다: ${destination}` },
        { status: 400 }
      );
    }

    console.log(`Geocoding successful:`, {
      origin: geocodeOrigin,
      destination: geocodeDestination,
    });

    // Naver Direction 5 API 호출
    const directionUrl = 'https://maps.apigw.ntruss.com/map-direction/v1/driving?' +
      new URLSearchParams({
        start: `${geocodeOrigin.lng},${geocodeOrigin.lat}`,
        goal: `${geocodeDestination.lng},${geocodeDestination.lat}`,
        option: 'trafast', // 실시간 빠른길
      });

    console.log(`Fetching route from Naver Directions API`);
    const directionResponse = await fetch(directionUrl, {
      headers: {
        'x-ncp-apigw-api-key-id': naverClientId,
        'x-ncp-apigw-api-key': naverClientSecret,
      },
    });

    if (!directionResponse.ok) {
      const errorText = await directionResponse.text();
      console.error('Naver Directions API error:', errorText);
      throw new Error('Failed to get route from Naver API');
    }

    const directionData = await directionResponse.json();

    if (directionData.code !== 0 || !directionData.route?.trafast?.[0]) {
      console.error('No route found:', directionData);
      return NextResponse.json(
        { error: 'No route found' },
        { status: 404 }
      );
    }

    const route = directionData.route.trafast[0];
    const summary = route.summary;

    console.log(`Driving route calculated: ${Math.ceil(summary.duration / 60000)}분, ${(summary.distance / 1000).toFixed(1)}km`);

    // ODsay 대중교통 경로 조회
    const odsayApiKey = process.env.ODSAY_API_KEY;
    let transitRoute = null;

    if (odsayApiKey && odsayApiKey !== 'your_odsay_api_key_here') {
      try {
        console.log('Fetching transit route from ODsay API');
        transitRoute = await getODsayRoute(
          geocodeOrigin.lng,
          geocodeOrigin.lat,
          geocodeDestination.lng,
          geocodeDestination.lat,
          odsayApiKey
        );
        console.log(`Transit route calculated: ${transitRoute?.duration}분`);
      } catch (error) {
        console.error('ODsay API error (continuing with driving route only):', error);
      }
    } else {
      console.log('ODsay API key not configured, skipping transit route');
    }

    // 경로 정보 반환 (자동차 + 대중교통)
    return NextResponse.json({
      driving: {
        duration: Math.ceil(summary.duration / 60000),
        distance: summary.distance,
        tollFare: summary.tollFare || 0,
        taxiFare: summary.taxiFare || 0,
        path: route.path,
        trafficInfo: {
          congestion: getCongestionLevel(summary.duration, summary.distance),
          realTimeDuration: Math.ceil(summary.duration / 60000),
        },
      },
      transit: transitRoute,
      // 하위 호환성을 위해 기본값은 자동차 경로
      duration: Math.ceil(summary.duration / 60000),
      distance: summary.distance,
    });
  } catch (error) {
    console.error('Route calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate route' },
      { status: 500 }
    );
  }
}

async function geocodeAddress(
  address: string,
  clientId: string,
  clientSecret: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = 'https://maps.apigw.ntruss.com/map-geocode/v2/geocode?' +
      new URLSearchParams({ query: address });

    const response = await fetch(url, {
      headers: {
        'x-ncp-apigw-api-key-id': clientId,
        'x-ncp-apigw-api-key': clientSecret,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Geocoding API error:', errorText);
      throw new Error('Geocoding failed');
    }

    const data = await response.json();

    if (data.addresses && data.addresses.length > 0) {
      const location = data.addresses[0];
      console.log(`Geocoded "${address}" → (${location.y}, ${location.x})`);
      return {
        lat: parseFloat(location.y),
        lng: parseFloat(location.x),
      };
    }

    console.warn(`No geocoding results for: ${address}`);
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

async function getODsayRoute(
  startLng: number,
  startLat: number,
  endLng: number,
  endLat: number,
  apiKey: string
): Promise<any> {
  try {
    const url = 'https://api.odsay.com/v1/api/searchPubTransPathT?' +
      new URLSearchParams({
        SX: startLng.toString(),
        SY: startLat.toString(),
        EX: endLng.toString(),
        EY: endLat.toString(),
        apiKey: apiKey,
      });

    console.log('ODsay API URL:', url);
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ODsay API error response:', errorText);
      throw new Error('Failed to get transit route from ODsay');
    }

    const data = await response.json();
    console.log('ODsay API response:', JSON.stringify(data, null, 2));

    if (!data.result || !data.result.path || data.result.path.length === 0) {
      console.warn('No transit route found in response');
      console.warn('Response structure:', JSON.stringify(data, null, 2));
      return null;
    }

    // 가장 빠른 경로 선택 (첫 번째 경로)
    const fastestPath = data.result.path[0];
    const info = fastestPath.info;
    const subPaths = fastestPath.subPath || [];

    // 단계별 경로 정보 추출
    const steps = subPaths.map((subPath: any) => {
      const step: any = {
        trafficType: subPath.trafficType, // 1: 지하철, 2: 버스, 3: 도보
        distance: subPath.distance || 0,
        sectionTime: subPath.sectionTime || 0,
      };

      if (subPath.trafficType === 1) {
        // 지하철
        step.transportType = 'subway';
        step.lineName = subPath.lane?.[0]?.name || '지하철';
        step.lineColor = `#${subPath.lane?.[0]?.color || '000000'}`;
        step.startStation = subPath.startName;
        step.endStation = subPath.endName;
        step.stationCount = subPath.stationCount || 0;
      } else if (subPath.trafficType === 2) {
        // 버스
        step.transportType = 'bus';
        step.lineName = subPath.lane?.[0]?.busNo || '버스';
        step.lineColor = `#${subPath.lane?.[0]?.color || '000000'}`;
        step.startStation = subPath.startName;
        step.endStation = subPath.endName;
        step.stationCount = subPath.stationCount || 0;
      } else if (subPath.trafficType === 3) {
        // 도보
        step.transportType = 'walk';
        step.instruction = `도보 ${Math.round(subPath.distance)}m`;
      }

      return step;
    });

    return {
      duration: info.totalTime, // 분 단위
      distance: info.totalDistance, // 미터 단위
      fare: info.payment, // 요금
      transferCount: info.busTransitCount + info.subwayTransitCount,
      steps: steps,
      walkDistance: info.totalWalk,
    };
  } catch (error) {
    console.error('ODsay route calculation error:', error);
    throw error;
  }
}

function getCongestionLevel(duration: number, distance: number): 'smooth' | 'normal' | 'slow' | 'blocked' {
  // 평균 속도 계산 (km/h)
  const speed = (distance / 1000) / (duration / 3600000);

  if (speed > 60) return 'smooth';
  if (speed > 40) return 'normal';
  if (speed > 20) return 'slow';
  return 'blocked';
}
