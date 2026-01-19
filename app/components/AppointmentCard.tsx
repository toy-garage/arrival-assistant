'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, differenceInMinutes, subMinutes } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Appointment } from './AppointmentList';
import RouteDetailsCard from './RouteDetailsCard';

interface AppointmentCardProps {
  appointment: Appointment;
}

export default function AppointmentCard({ appointment }: AppointmentCardProps) {
  const [timeUntilDeparture, setTimeUntilDeparture] = useState<number | null>(null);
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
  const [addedToCalendar, setAddedToCalendar] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      if (!appointment.travelDuration) return;

      const startTime = parseISO(appointment.startTime);
      const arrivalTime = subMinutes(startTime, 5); // 5분 전 도착
      const prepStartTime = subMinutes(arrivalTime, appointment.travelDuration + appointment.preparationTime);

      const now = new Date();
      const minutesUntil = differenceInMinutes(prepStartTime, now);

      setTimeUntilDeparture(minutesUntil);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // 1분마다 업데이트

    return () => clearInterval(interval);
  }, [appointment]);

  const startTime = parseISO(appointment.startTime);
  const arrivalTime = subMinutes(startTime, 5);

  // 준비 시작 시간과 출발 시간을 구분
  const preparationStartTime = appointment.travelDuration
    ? subMinutes(arrivalTime, appointment.travelDuration + appointment.preparationTime)
    : null;
  const departureTime = appointment.travelDuration
    ? subMinutes(arrivalTime, appointment.travelDuration)
    : null;

  const getStatusColor = () => {
    if (!timeUntilDeparture) return 'bg-gray-100 text-gray-800';
    if (timeUntilDeparture <= 0) return 'bg-red-100 text-red-800';
    if (timeUntilDeparture <= 15) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = () => {
    if (!timeUntilDeparture) return '경로 계산 중';
    if (timeUntilDeparture <= 0) return '지금 준비!';
    if (timeUntilDeparture <= 15) return `${timeUntilDeparture}분 후 준비`;
    return `${Math.floor(timeUntilDeparture / 60)}시간 ${timeUntilDeparture % 60}분 후 준비`;
  };

  const handleAddToCalendar = async () => {
    if (!departureTime || isAddingToCalendar) return;

    setIsAddingToCalendar(true);
    try {
      const accessToken = localStorage.getItem('google_access_token');
      if (!accessToken) {
        alert('Google Calendar에 연결되어 있지 않습니다.');
        return;
      }

      const response = await fetch('/api/calendar/add-departure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          originalEventId: appointment.id,
          departureTime: departureTime.toISOString(),
          destination: appointment.location,
          originalEventStart: appointment.startTime,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add departure event');
      }

      const data = await response.json();
      console.log('Departure event added:', data);
      setAddedToCalendar(true);

      // 3초 후 상태 초기화
      setTimeout(() => setAddedToCalendar(false), 3000);
    } catch (error) {
      console.error('Error adding to calendar:', error);
      alert('캘린더 추가 중 오류가 발생했습니다.');
    } finally {
      setIsAddingToCalendar(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{appointment.title}</h3>
          <div className="flex items-center text-gray-600 text-sm mb-2">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {appointment.location}
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor()}`}>
          {getStatusText()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">약속 시간</p>
          <p className="font-semibold text-gray-900">{format(startTime, 'HH:mm', { locale: ko })}</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-3">
          <p className="text-xs text-indigo-600 mb-1">도착 목표</p>
          <p className="font-semibold text-indigo-900">{format(arrivalTime, 'HH:mm', { locale: ko })}</p>
          <p className="text-xs text-indigo-600">(5분 전)</p>
        </div>
      </div>

      {preparationStartTime && departureTime && (
        <div className="space-y-2">
          {/* 타임라인 */}
          <div className="space-y-3">
            {/* 준비 시작 */}
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <div>
                    <p className="text-xs text-purple-600 font-medium">준비 시작</p>
                    <p className="text-sm text-gray-600">{appointment.preparationTime}분 준비</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-purple-900">
                  {format(preparationStartTime, 'HH:mm', { locale: ko })}
                </span>
              </div>
            </div>

            {/* 출발 시간 */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-3 border-2 border-indigo-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-indigo-600 font-medium">출발</p>
                    <p className="text-sm text-gray-600">{appointment.travelDuration}분 이동</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-indigo-900">
                  {format(departureTime, 'HH:mm', { locale: ko })}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddToCalendar}
            disabled={isAddingToCalendar || addedToCalendar}
            className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition flex items-center justify-center ${
              addedToCalendar
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800'
            }`}
          >
            {addedToCalendar ? (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                캘린더에 추가됨
              </>
            ) : isAddingToCalendar ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                추가 중...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                출발 시간 캘린더에 추가
              </>
            )}
          </button>
        </div>
      )}

      {appointment.routeDetails && (
        <RouteDetailsCard routeDetails={appointment.routeDetails} />
      )}
    </div>
  );
}
