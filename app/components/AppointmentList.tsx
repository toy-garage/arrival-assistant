'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, isBefore, addMinutes } from 'date-fns';
import { ko } from 'date-fns/locale';
import AppointmentCard from './AppointmentCard';

export interface Appointment {
  id: string;
  title: string;
  location: string;
  startTime: string;
  endTime: string;
  departureTime?: string;
  travelDuration?: number;
  preparationTime: number;
}

export default function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      // 기본값은 빈 배열 (사용자가 캘린더 동기화 버튼을 눌러야 데이터 로드)
      setAppointments([]);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRoute = async (origin: string, destination: string) => {
    try {
      const response = await fetch('/api/route/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin,
          destination,
        }),
      });

      if (!response.ok) {
        console.error('Route calculation failed:', await response.text());
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error calculating route:', error);
      return null;
    }
  };

  const syncCalendar = async () => {
    try {
      setSyncing(true);

      const accessToken = localStorage.getItem('google_access_token');
      const refreshToken = localStorage.getItem('google_refresh_token');

      if (!accessToken) {
        alert('Google Calendar가 연결되지 않았습니다.\n\n설정 메뉴에서 "Google Calendar 연결"을 먼저 진행해주세요.');
        return;
      }

      // 집 주소 확인
      const homeAddress = localStorage.getItem('homeAddress');
      if (!homeAddress) {
        alert('집 주소가 설정되지 않았습니다.\n\n설정 메뉴에서 집 주소를 먼저 입력해주세요.');
        return;
      }

      // Google Calendar API에서 이벤트 가져오기 (자동 토큰 갱신 포함)
      let token = accessToken;
      let response = await fetch('/api/calendar', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 401 에러 시 토큰 갱신 후 재시도
      if (response.status === 401) {
        console.log('Access token expired, attempting to refresh...');

        if (!refreshToken) {
          console.error('No refresh token available');
          localStorage.removeItem('google_access_token');
          alert('Google Calendar 인증이 만료되었습니다.\n\n설정에서 다시 연결해주세요.');
          return;
        }

        try {
          // Refresh token으로 새 access token 발급
          const refreshResponse = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              refresh_token: refreshToken,
            }),
          });

          if (!refreshResponse.ok) {
            throw new Error('Failed to refresh token');
          }

          const refreshData = await refreshResponse.json();
          const newAccessToken = refreshData.access_token;

          // 새 토큰 저장
          localStorage.setItem('google_access_token', newAccessToken);
          token = newAccessToken;

          console.log('Access token refreshed successfully');

          // 새 토큰으로 재시도
          response = await fetch('/api/calendar', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch calendar events after refresh');
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          localStorage.removeItem('google_access_token');
          localStorage.removeItem('google_refresh_token');
          alert('Google Calendar 인증에 실패했습니다.\n\n설정에서 다시 연결해주세요.');
          return;
        }
      } else if (!response.ok) {
        const errorText = await response.text();
        console.error('Calendar API error:', errorText);
        throw new Error('Failed to fetch calendar events');
      }

      const data = await response.json();

      if (data.appointments && data.appointments.length > 0) {
        // 설정에서 기본 준비 시간 가져오기
        const defaultPrepTime = parseInt(localStorage.getItem('defaultPrepTime') || '15');

        // 각 약속에 대해 경로 계산
        const appointmentsWithRoutes = await Promise.all(
          data.appointments.map(async (appointment: Appointment) => {
            // API에서 받은 preparationTime이 기본값(15)이면 설정값으로 교체
            const prepTime = appointment.preparationTime === 15 ? defaultPrepTime : appointment.preparationTime;
            // 장소가 "장소 미정"이면 경로 계산 생략
            if (!appointment.location || appointment.location === '장소 미정') {
              return {
                ...appointment,
                preparationTime: prepTime,
              };
            }

            console.log(`Calculating route: ${homeAddress} → ${appointment.location}`);

            const routeData = await calculateRoute(homeAddress, appointment.location);

            if (routeData) {
              // 대중교통 경로가 있으면 대중교통 우선, 없으면 자동차 경로 사용
              const primaryRoute = routeData.transit || routeData.driving || routeData;
              const hasBothRoutes = routeData.transit && routeData.driving;

              return {
                ...appointment,
                preparationTime: prepTime,
                travelDuration: primaryRoute.duration || routeData.duration,
                routeDetails: {
                  transportMode: routeData.transit ? 'transit' : 'driving',
                  summary: routeData.transit
                    ? `대중교통 ${primaryRoute.duration}분 (환승 ${primaryRoute.transferCount}회)`
                    : `자동차 ${(primaryRoute.distance / 1000).toFixed(1)}km, ${primaryRoute.duration}분`,
                  distance: primaryRoute.distance,
                  duration: primaryRoute.duration,
                  steps: primaryRoute.steps,
                  fare: primaryRoute.fare,
                  // 두 경로 모두 저장
                  drivingRoute: routeData.driving,
                  transitRoute: routeData.transit,
                },
              };
            }

            return {
              ...appointment,
              preparationTime: prepTime,
            };
          })
        );

        setAppointments(appointmentsWithRoutes);
        console.log(`Loaded ${appointmentsWithRoutes.length} appointments with routes`);
      } else {
        alert('오늘 예정된 약속이 없습니다.');
      }
    } catch (error) {
      console.error('Failed to sync calendar:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      alert(`캘린더 동기화에 실패했습니다.\n\n오류: ${errorMessage}\n\n설정에서 Google Calendar 연결 상태를 확인해주세요.`);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">오늘의 약속</h2>
        <button
          onClick={syncCalendar}
          disabled={syncing}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
        >
          <svg
            className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>{syncing ? '동기화 중...' : '캘린더 동기화'}</span>
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">등록된 일정이 없습니다</h3>
          <p className="text-gray-600 mb-6">시작하려면 아래 단계를 따라주세요</p>

          <div className="text-left bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-indigo-600">1</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">설정에서 Google Calendar 연결</p>
                <p className="text-sm text-gray-600">우측 상단 설정 아이콘 → Google Calendar 연결</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-indigo-600">2</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">집 주소 입력</p>
                <p className="text-sm text-gray-600">경로 계산을 위한 출발지 주소</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-indigo-600">3</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">캘린더 동기화</p>
                <p className="text-sm text-gray-600">아래 버튼을 눌러 일정 불러오기</p>
              </div>
            </div>
          </div>

          <button
            onClick={syncCalendar}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>캘린더 동기화하기</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      )}
    </div>
  );
}
