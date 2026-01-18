'use client';

import { useState, useEffect } from 'react';
import type { FavoriteLocation } from '../types';
import AddressSearchInput from './AddressSearchInput';

interface SettingsModalProps {
  onClose: () => void;
}

const CATEGORY_ICONS = {
  home: '🏠',
  work: '🏢',
  cafe: '☕',
  school: '🎓',
  gym: '💪',
  restaurant: '🍽️',
  other: '📍',
};

const CATEGORY_LABELS = {
  home: '집',
  work: '회사',
  cafe: '카페',
  school: '학교',
  gym: '헬스장',
  restaurant: '식당',
  other: '기타',
};

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [homeAddress, setHomeAddress] = useState('');
  const [defaultPrepTime, setDefaultPrepTime] = useState(15);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [favoriteLocations, setFavoriteLocations] = useState<FavoriteLocation[]>([]);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    category: 'other' as FavoriteLocation['category'],
  });

  useEffect(() => {
    // 저장된 설정 불러오기
    const savedHome = localStorage.getItem('homeAddress') || '';
    const savedPrepTime = parseInt(localStorage.getItem('defaultPrepTime') || '15');
    setHomeAddress(savedHome);
    setDefaultPrepTime(savedPrepTime);

    // 알림 권한 확인
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    // Google Calendar 연결 상태 확인
    const accessToken = localStorage.getItem('google_access_token');
    setIsCalendarConnected(!!accessToken);

    // 즐겨찾기 위치 불러오기
    const savedLocations = localStorage.getItem('favoriteLocations');
    if (savedLocations) {
      setFavoriteLocations(JSON.parse(savedLocations));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('homeAddress', homeAddress);
    localStorage.setItem('defaultPrepTime', defaultPrepTime.toString());
    localStorage.setItem('favoriteLocations', JSON.stringify(favoriteLocations));
    onClose();
  };

  const addFavoriteLocation = () => {
    if (!newLocation.name || !newLocation.address) {
      alert('이름과 주소를 모두 입력해주세요.');
      return;
    }

    const location: FavoriteLocation = {
      id: Date.now().toString(),
      name: newLocation.name,
      address: newLocation.address,
      icon: CATEGORY_ICONS[newLocation.category],
      category: newLocation.category,
      createdAt: new Date().toISOString(),
    };

    setFavoriteLocations([...favoriteLocations, location]);
    setNewLocation({ name: '', address: '', category: 'other' });
    setShowAddLocation(false);
  };

  const deleteFavoriteLocation = (id: string) => {
    if (confirm('이 위치를 삭제하시겠습니까?')) {
      setFavoriteLocations(favoriteLocations.filter((loc) => loc.id !== id));
    }
  };

  const useFavoriteAsHome = (address: string) => {
    setHomeAddress(address);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    }
  };

  const connectGoogleCalendar = () => {
    // Google Calendar OAuth 흐름 시작
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      '/api/auth/google?action=login',
      'Google Calendar 연결',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // 팝업이 닫힐 때까지 대기
    const interval = setInterval(() => {
      if (popup?.closed) {
        clearInterval(interval);
        // URL에서 토큰 확인
        const params = new URLSearchParams(window.location.search);
        if (params.get('calendar_connected') === 'true') {
          setIsCalendarConnected(true);
          alert('Google Calendar가 성공적으로 연결되었습니다!');
        }
        // 연결 상태 다시 확인
        const accessToken = localStorage.getItem('google_access_token');
        setIsCalendarConnected(!!accessToken);
      }
    }, 500);
  };

  const disconnectGoogleCalendar = () => {
    if (confirm('Google Calendar 연결을 해제하시겠습니까?')) {
      localStorage.removeItem('google_access_token');
      localStorage.removeItem('google_refresh_token');
      setIsCalendarConnected(false);
      // 헤더 업데이트를 위한 이벤트 발생
      window.dispatchEvent(new Event('storage'));
      alert('Google Calendar 연결이 해제되었습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">설정</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Google Calendar 연동 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">캘린더 연동</h3>

            {isCalendarConnected ? (
              // 연결된 상태
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-green-900">Google Calendar 연결됨</p>
                  </div>
                </div>
                <button
                  onClick={disconnectGoogleCalendar}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition font-medium flex-shrink-0"
                >
                  해제
                </button>
              </div>
            ) : (
              // 연결 안 된 상태
              <button
                onClick={connectGoogleCalendar}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-medium">Google Calendar 연결</span>
              </button>
            )}
          </div>

          {/* 집 주소 설정 */}
          <div>
            <AddressSearchInput
              value={homeAddress}
              onChange={setHomeAddress}
              placeholder="주소를 검색하세요 (예: 강남구 역삼동)"
              label="집 주소"
              helperText="경로 계산의 출발지로 사용됩니다"
            />
          </div>

          {/* 즐겨찾기 위치 */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">즐겨찾기 위치</h3>
              <button
                onClick={() => setShowAddLocation(!showAddLocation)}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {showAddLocation ? '취소' : '+ 추가'}
              </button>
            </div>

            {/* 즐겨찾기 추가 폼 */}
            {showAddLocation && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    카테고리
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(Object.keys(CATEGORY_ICONS) as FavoriteLocation['category'][]).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setNewLocation({ ...newLocation, category: cat })}
                        className={`p-2 rounded-lg text-center transition ${
                          newLocation.category === cat
                            ? 'bg-indigo-100 border-2 border-indigo-500'
                            : 'bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-2xl mb-1">{CATEGORY_ICONS[cat]}</div>
                        <div className="text-xs text-gray-700">{CATEGORY_LABELS[cat]}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이름
                  </label>
                  <input
                    type="text"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                    placeholder="예: 우리집, 회사, 단골 카페"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    주소
                  </label>
                  <AddressSearchInput
                    value={newLocation.address}
                    onChange={(address) => setNewLocation({ ...newLocation, address })}
                    placeholder="주소를 검색하세요"
                  />
                </div>
                <button
                  onClick={addFavoriteLocation}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  추가하기
                </button>
              </div>
            )}

            {/* 즐겨찾기 목록 */}
            {favoriteLocations.length > 0 ? (
              <div className="space-y-2">
                {favoriteLocations.map((location) => (
                  <div
                    key={location.id}
                    className="flex items-start justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="text-2xl flex-shrink-0 leading-tight">{location.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate" title={location.name}>{location.name}</p>
                        <p className="text-sm text-gray-600 truncate" title={location.address}>{location.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 flex-shrink-0 ml-2">
                      <button
                        onClick={() => useFavoriteAsHome(location.address)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition flex-shrink-0"
                        title="집 주소로 설정"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteFavoriteLocation(location.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                        title="삭제"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                자주 가는 장소를 추가해보세요
              </p>
            )}
          </div>

          {/* 기본 준비 시간 */}
          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              기본 준비 시간
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={defaultPrepTime}
                onChange={(e) => setDefaultPrepTime(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="font-semibold text-indigo-600 w-16 text-right">
                {defaultPrepTime}분
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              외출 전 준비하는 시간
            </p>
          </div>

          {/* 알림 설정 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">알림 설정</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">출발 알림 받기</p>
                  <p className="text-sm text-gray-500">출발 시간에 알림을 받습니다</p>
                </div>
                <button
                  onClick={requestNotificationPermission}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    notificationsEnabled ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
            </div>
          </div>

          {/* 정보 */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>버전</span>
              <span className="font-medium">1.0.0</span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
          <button
            onClick={handleSave}
            className="w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
