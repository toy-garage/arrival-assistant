# Arrival Assistant - 약속 도착 비서 ⏰

약속 시간에 정확히 5분 전 도착할 수 있도록 도와주는 스마트 비서 앱입니다.

## 주요 기능

✨ **핵심 기능**
- 📅 Google Calendar 자동 연동
- 🗺️ Naver Maps API를 통한 실시간 경로 계산
- ⏰ 정확한 출발 시간 자동 계산 (약속 5분 전 도착 목표)
- 🔔 출발 시간 푸시 알림
- 🚗 실시간 교통 상황 반영
- ⚙️ 개인 맞춤 준비 시간 설정

📱 **PWA 지원**
- 홈 화면에 앱 설치 가능
- 오프라인 동작 지원
- 네이티브 앱 같은 사용자 경험

## 시작하기

### 필수 요구사항

- Node.js 18.0 이상
- npm 또는 yarn
- Google Cloud Console 계정 (Calendar API용)
- Naver Cloud Platform 계정 (Maps API용)

### 설치

1. 저장소 클론 및 의존성 설치

```bash
cd arrival-assistant
npm install
```

2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```bash
# Google Calendar API
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Naver Maps API
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
```

### API 키 발급 방법

#### Google Calendar API

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성
3. "API 및 서비스" > "라이브러리"에서 "Google Calendar API" 활성화
4. "사용자 인증 정보" > "OAuth 2.0 클라이언트 ID" 생성
5. 승인된 리디렉션 URI에 `http://localhost:3000/api/auth/callback` 추가

#### Naver Maps API

1. [Naver Cloud Platform](https://www.ncloud.com/)에 가입 및 로그인
2. "서비스" > "AI·Application Service" > "Maps" 선택
3. "Application 등록" 클릭
4. "Web Dynamic Map", "Geocoding", "Directions" 서비스 선택
5. Client ID와 Client Secret 발급받기

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드 및 배포

```bash
npm run build
npm start
```

## 프로젝트 구조

```
arrival-assistant/
├── app/
│   ├── api/              # API 라우트
│   │   ├── calendar/     # Google Calendar 연동
│   │   └── route/        # 경로 계산
│   ├── components/       # React 컴포넌트
│   │   ├── Header.tsx
│   │   ├── AppointmentList.tsx
│   │   ├── AppointmentCard.tsx
│   │   └── SettingsModal.tsx
│   ├── lib/              # 유틸리티 함수
│   │   ├── calendar.ts   # Calendar API 헬퍼
│   │   ├── route.ts      # 경로 계산 헬퍼
│   │   └── notifications.ts  # 알림 헬퍼
│   ├── types/            # TypeScript 타입 정의
│   ├── layout.tsx        # 루트 레이아웃
│   ├── page.tsx          # 메인 페이지
│   └── globals.css       # 전역 스타일
├── public/
│   └── manifest.json     # PWA 매니페스트
├── next.config.ts        # Next.js 설정
├── tailwind.config.ts    # Tailwind CSS 설정
└── tsconfig.json         # TypeScript 설정
```

## 사용 방법

### 1. 초기 설정

1. 앱을 실행하고 우측 상단의 설정(⚙️) 버튼 클릭
2. "Google Calendar 연결" 버튼을 클릭하여 캘린더 연동
3. 집 주소 입력 (경로 계산의 출발지로 사용)
4. 기본 준비 시간 설정 (외출 전 준비하는 시간)
5. 출발 알림 켜기

### 2. 약속 확인

- 메인 화면에서 오늘의 약속 목록 확인
- 각 약속 카드에서 다음 정보 확인:
  - 약속 시간
  - 도착 목표 시간 (5분 전)
  - 출발 시간
  - 이동 시간
  - 준비 시간

### 3. 출발 알림 받기

- 설정한 출발 시간에 자동으로 푸시 알림 수신
- 브라우저의 알림 권한 허용 필요

### 4. PWA 설치 (선택사항)

- 앱 상단의 "앱으로 설치하기" 배너 클릭
- 또는 브라우저 메뉴에서 "홈 화면에 추가" 선택

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **PWA**: @ducanh2912/next-pwa
- **APIs**:
  - Google Calendar API (캘린더 연동)
  - Naver Maps Direction API (경로 계산)
  - Naver Maps Geocoding API (주소 → 좌표 변환)
- **Date Handling**: date-fns
- **HTTP Client**: axios

## 주요 알고리즘

### 출발 시간 계산

```
출발 시간 = 약속 시간 - 5분(일찍 도착) - 이동 시간 - 준비 시간
```

예시:
- 약속 시간: 14:00
- 이동 시간: 25분
- 준비 시간: 10분
- **출발 시간: 13:20** (14:00 - 5분 - 25분 - 10분)

### 실시간 교통 반영

Naver Direction API의 `trafast` 옵션을 사용하여 현재 교통 상황을 고려한 최적 경로를 계산합니다.

## 개발 로드맵

- [x] 기본 UI 구현
- [x] Google Calendar 연동
- [x] Naver Maps 경로 계산
- [x] 출발 시간 계산 로직
- [x] 푸시 알림 기능
- [x] PWA 지원
- [ ] 대중교통 경로 지원
- [ ] 여러 출발지 지원 (집, 회사 등)
- [ ] 날씨 정보 연동
- [ ] 약속 히스토리 및 통계

## 라이선스

ISC

## 기여하기

이슈와 Pull Request를 환영합니다!

## 문의

문제가 발생하거나 제안사항이 있으시면 GitHub Issues를 통해 알려주세요.
