import { NextRequest, NextResponse } from 'next/server';

interface SearchResult {
  roadAddress: string;
  jibunAddress: string;
  displayAddress: string;
  placeName?: string;
  category?: string;
  lat: number;
  lng: number;
  type: 'address' | 'place';
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter required' },
        { status: 400 }
      );
    }

    const naverClientId = process.env.NAVER_CLIENT_ID;
    const naverClientSecret = process.env.NAVER_CLIENT_SECRET;
    const naverSearchClientId = process.env.NAVER_SEARCH_CLIENT_ID;
    const naverSearchClientSecret = process.env.NAVER_SEARCH_CLIENT_SECRET;

    if (!naverClientId || !naverClientSecret) {
      return NextResponse.json(
        { error: 'Naver API credentials not configured' },
        { status: 500 }
      );
    }

    const allResults: SearchResult[] = [];

    // 1. 네이버 Local Search API로 장소 검색 (POI)
    if (naverSearchClientId && naverSearchClientSecret) {
      try {
        const localSearchUrl = 'https://openapi.naver.com/v1/search/local.json?' +
          new URLSearchParams({
            query: query,
            display: '5',
            sort: 'random',
          });

        const localResponse = await fetch(localSearchUrl, {
          headers: {
            'X-Naver-Client-Id': naverSearchClientId,
            'X-Naver-Client-Secret': naverSearchClientSecret,
          },
        });

      if (localResponse.ok) {
        const localData = await localResponse.json();
        console.log('Local Search API response:', JSON.stringify(localData, null, 2));
        const placeResults = (localData.items || []).map((item: any) => ({
          roadAddress: item.roadAddress || item.address || '',
          jibunAddress: item.address || '',
          displayAddress: item.roadAddress || item.address || '',
          placeName: item.title.replace(/<\/?b>/g, ''), // HTML 태그 제거
          category: item.category,
          lat: parseFloat(item.mapy) / 10000000,
          lng: parseFloat(item.mapx) / 10000000,
          type: 'place' as const,
        }));

        console.log(`Local Search found ${placeResults.length} places`);
        allResults.push(...placeResults);
      }
      } catch (error) {
        console.error('Local Search API error:', error);
        // 에러가 나도 계속 진행 (Geocoding 결과라도 보여주기 위해)
      }
    } else {
      console.log('Local Search API credentials not configured, skipping place search');
    }

    // 2. 네이버 Geocoding API로 주소 검색
    try {
      const geocodingUrl = 'https://maps.apigw.ntruss.com/map-geocode/v2/geocode?' +
        new URLSearchParams({ query });

      const geocodingResponse = await fetch(geocodingUrl, {
        headers: {
          'x-ncp-apigw-api-key-id': naverClientId,
          'x-ncp-apigw-api-key': naverClientSecret,
        },
      });

      if (geocodingResponse.ok) {
        const geocodingData = await geocodingResponse.json();
        const addressResults = (geocodingData.addresses || []).map((address: any) => ({
          roadAddress: address.roadAddress || '',
          jibunAddress: address.jibunAddress || '',
          displayAddress: address.roadAddress || address.jibunAddress || '',
          lat: parseFloat(address.y),
          lng: parseFloat(address.x),
          type: 'address' as const,
        }));

        allResults.push(...addressResults);
      }
    } catch (error) {
      console.error('Geocoding API error:', error);
      // 에러가 나도 계속 진행 (Local Search 결과라도 보여주기 위해)
    }

    // 결과가 하나도 없으면 빈 배열 반환
    if (allResults.length === 0) {
      console.log('No search results found for query:', query);
      return NextResponse.json({ results: [] });
    }

    // 장소 검색 결과를 우선 순위로 (사용자가 원하는 것일 가능성이 높음)
    const sortedResults = allResults.sort((a, b) => {
      if (a.type === 'place' && b.type === 'address') return -1;
      if (a.type === 'address' && b.type === 'place') return 1;
      return 0;
    });

    console.log(`Found ${sortedResults.length} results for query:`, query);
    return NextResponse.json({ results: sortedResults });
  } catch (error) {
    console.error('Address search error:', error);
    return NextResponse.json(
      { error: 'Failed to search address' },
      { status: 500 }
    );
  }
}
