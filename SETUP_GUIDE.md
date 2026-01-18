# Arrival Assistant - 설정 가이드

## Google Calendar API 설정

### 1. Google Cloud Console 접속
https://console.cloud.google.com/

### 2. 프로젝트 생성
1. 상단 프로젝트 선택 드롭다운 클릭
2. "새 프로젝트" 클릭
3. 프로젝트 이름: "Arrival Assistant" 입력
4. "만들기" 클릭

### 3. Google Calendar API 활성화
1. 좌측 메뉴 > "API 및 서비스" > "라이브러리"
2. "Google Calendar API" 검색
3. "Google Calendar API" 클릭
4. "사용 설정" 클릭

### 4. OAuth 동의 화면 구성
1. 좌측 메뉴 > "API 및 서비스" > "OAuth 동의 화면"
2. 사용자 유형: "외부" 선택 후 "만들기"
3. 앱 정보 입력:
   - 앱 이름: "Arrival Assistant"
   - 사용자 지원 이메일: 본인 이메일
   - 개발자 연락처: 본인 이메일
4. "저장 후 계속" 클릭
5. 범위 추가:
   - "범위 추가 또는 삭제" 클릭
   - ".../auth/calendar.readonly" 검색 후 선택
   - "업데이트" 클릭
6. "저장 후 계속" 클릭
7. 테스트 사용자 추가 (본인 구글 계정)
8. "저장 후 계속" 클릭

### 5. OAuth 클라이언트 ID 생성
1. 좌측 메뉴 > "API 및 서비스" > "사용자 인증 정보"
2. 상단 "+ 사용자 인증 정보 만들기" 클릭
3. "OAuth 2.0 클라이언트 ID" 선택
4. 애플리케이션 유형: "웹 애플리케이션"
5. 이름: "Arrival Assistant Web Client"
6. 승인된 리디렉션 URI:
   ```
   http://localhost:3000/api/auth/callback
   ```
7. "만들기" 클릭
8. **클라이언트 ID와 클라이언트 보안 비밀번호 복사**

### 6. .env.local 파일 업데이트
```bash
# .env.local 파일 열기
# 아래 값을 Google Console에서 복사한 값으로 교체

NEXT_PUBLIC_APP_URL=http://localhost:3000

# 여기에 실제 값 입력
GOOGLE_CLIENT_ID=복사한_클라이언트_ID
GOOGLE_CLIENT_SECRET=복사한_클라이언트_보안_비밀번호

# Naver Maps는 선택사항 (경로 계산용)
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
```

### 7. 서버 재시작
```bash
# 터미널에서 Ctrl+C로 서버 종료
# 다시 실행
npm run dev
```

### 8. 테스트
1. http://localhost:3000 접속
2. 설정(⚙️) 클릭
3. "Google Calendar 연결" 클릭
4. Google 로그인 팝업에서 인증
5. "캘린더 동기화" 버튼으로 약속 불러오기

## Naver Maps API 설정 (선택사항)

### 1. Naver Cloud Platform 접속
https://www.ncloud.com/

### 2. 회원가입 및 로그인

### 3. 콘솔 접속
https://console.ncloud.com/

### 4. Application 등록
1. Services > AI·Application Service > Maps
2. "Application 등록" 클릭
3. Application 이름: "Arrival Assistant"
4. 서비스 선택:
   - Web Dynamic Map
   - Geocoding
   - Directions
5. "등록" 클릭

### 5. 인증 정보 복사
- Client ID
- Client Secret

### 6. .env.local 업데이트
```bash
NAVER_CLIENT_ID=복사한_클라이언트_ID
NAVER_CLIENT_SECRET=복사한_클라이언트_Secret
```

## 문제 해결

### "Google Client ID not configured" 에러
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 서버를 재시작했는지 확인

### OAuth 팝업이 열리지 않음
- 팝업 차단이 해제되어 있는지 확인
- 리디렉션 URI가 정확히 일치하는지 확인

### "인증이 만료되었습니다" 메시지
- 설정에서 다시 "Google Calendar 연결" 클릭
