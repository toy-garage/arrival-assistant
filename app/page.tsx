'use client';

import { useState, useEffect } from 'react';
import AppointmentList from './components/AppointmentList';
import Header from './components/Header';
import SettingsModal from './components/SettingsModal';

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // OAuth 콜백 처리
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken) {
      localStorage.setItem('google_access_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('google_refresh_token', refreshToken);
      }
      // URL 파라미터 제거
      window.history.replaceState({}, '', window.location.pathname);
    }

    // PWA 설치 프롬프트 감지
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstallable(false);
    }

    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Header onSettingsClick={() => setShowSettings(true)} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {isInstallable && (
          <div className="mb-6 p-4 bg-indigo-100 border border-indigo-300 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-semibold text-indigo-900">앱으로 설치하기</p>
              <p className="text-sm text-indigo-700">홈 화면에 추가하고 더 편리하게 사용하세요</p>
            </div>
            <button
              onClick={handleInstall}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              설치
            </button>
          </div>
        )}

        <AppointmentList />
      </main>

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
