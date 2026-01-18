# Naver Maps API 설정 가이드

## 1. 네이버 클라우드 플랫폼 회원가입

### 1-1. 접속
https://www.ncloud.com/

### 1-2. 회원가입
1. 우측 상단 "회원가입" 클릭
2. 본인 인증 (휴대폰 인증 또는 아이핀 인증)
3. 약관 동의 및 정보 입력
4. 회원가입 완료

### 1-3. 로그인
https://www.ncloud.com/

---

## 2. 콘솔 접속

### 2-1. 콘솔 페이지 이동
https://console.ncloud.com/

또는 메인 페이지 우측 상단 "Console" 클릭

### 2-2. 신용카드 등록 (필수)
- 처음 사용 시 결제 수단 등록 필요
- 무료 이용 가능하지만 카드 등록은 필수
- Services > My Page > 결제 관리 > 결제 수단 관리

---

## 3. Maps API 서비스 신청

### 3-1. AI·NAVER API 메뉴 접속
1. 콘솔 좌측 메뉴에서 "Services" 클릭
2. "AI·NAVER API" 카테고리 찾기
3. **"Maps"** 클릭

또는 직접 접속:
https://console.ncloud.com/naver-service/application

### 3-2. Application 등록
1. 우측 상단 **"Application 등록"** 버튼 클릭

2. Application 정보 입력:
   - **Application 이름**: `Arrival Assistant` (또는 원하는 이름)

3. **Service 선택** (중요! 아래 3개 모두 선택):
   - ✅ **Web Dynamic Map** (지도 표시)
   - ✅ **Geocoding** (주소 → 좌표 변환)
   - ✅ **Directions** (경로 탐색)

4. Web 서비스 URL:
   ```
   http://localhost:3000
   ```

5. **"등록"** 버튼 클릭

---

## 4. 인증 정보 확인

### 4-1. 생성된 Application 확인
- Application 목록에서 방금 생성한 "Arrival Assistant" 찾기
- Application 이름 클릭

### 4-2. 인증 정보 복사
다음 2개의 키를 복사하세요:

```
Client ID: xxxxxxxxx
Client Secret: xxxxxxxxxxxxxxxxxxxx
```

**주의:** Client Secret은 다시 확인할 수 없으니 안전한 곳에 보관!

---

## 5. .env.local 파일 업데이트

프로젝트 루트의 `.env.local` 파일을 열고 업데이트:

```bash
# App URL (for OAuth callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google Calendar API
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Naver Maps API
NAVER_CLIENT_ID=복사한_네이버_Client_ID
NAVER_CLIENT_SECRET=복사한_네이버_Client_Secret
```

---

## 6. 서버 재시작

```bash
# 터미널에서 Ctrl+C로 서버 종료
# 다시 실행
npm run dev
```

---

## 7. 테스트

### 7-1. 기본 테스트
1. http://localhost:3000 접속
2. 설정(⚙️) > "집 주소" 입력
   - 예: "서울특별시 강남구 역삼동"
3. 저장

### 7-2. 경로 계산 테스트
1. Google Calendar 연동으로 약속 불러오기
2. 약속 카드에서 상세 경로 정보 확인
3. 실시간 교통 정보가 반영된 이동 시간 표시

---

## 주요 기능

### Geocoding (주소 → 좌표 변환)
- 집 주소 → 위도/경도
- 약속 장소 주소 → 위도/경도

### Directions (경로 탐색)
- 출발지 → 목적지 최적 경로
- 실시간 교통 정보 반영
- 이동 시간, 거리 계산
- 단계별 경로 안내

### 옵션
- `trafast`: 실시간 빠른길 (기본값)
- `tracomfort`: 편안한 길
- `traoptimal`: 최적 경로

---

## 요금 정책

### 무료 이용 한도 (월간)
- **Web Dynamic Map**: 30,000건
- **Geocoding**: 30,000건
- **Directions**: 30,000건

### 개인 사용
- 하루 약속 10개 × 30일 = 300건/월
- **충분히 무료로 사용 가능!**

### 초과 시 요금
- Geocoding: 건당 2원
- Directions: 건당 5원

→ 일반적인 개인 사용에는 무료 한도 내에서 충분

---

## 문제 해결

### "Application을 찾을 수 없습니다" 오류
- Application 등록이 제대로 되지 않았을 수 있음
- 콘솔에서 Application 목록 확인
- 필요시 다시 등록

### "인증 실패" 오류
- Client ID/Secret이 정확한지 확인
- .env.local 파일 저장 후 서버 재시작 확인

### 경로가 계산되지 않음
- Directions 서비스가 선택되어 있는지 확인
- Application 상세 > Service 탭에서 확인
- 체크되어 있지 않으면 수정 후 저장

### 주소를 찾을 수 없음
- 정확한 주소 형식으로 입력
- 예: "서울특별시 강남구 역삼동" (동까지 입력)
- "강남역" 같은 지명도 가능

---

## API 문서

더 자세한 내용은 공식 문서 참고:
- https://api.ncloud-docs.com/docs/ai-naver-mapsgeocode
- https://api.ncloud-docs.com/docs/ai-naver-mapsdirections5

---

## 빠른 체크리스트

완료 여부를 체크하세요:

- [ ] 네이버 클라우드 플랫폼 회원가입
- [ ] 결제 수단 등록 (신용카드)
- [ ] Maps Application 등록
- [ ] Web Dynamic Map, Geocoding, Directions 서비스 선택
- [ ] Client ID, Client Secret 복사
- [ ] .env.local 파일에 키 입력
- [ ] 서버 재시작
- [ ] 설정에서 집 주소 입력
- [ ] 경로 정보 확인

모두 완료하셨다면 실시간 교통 정보가 반영된 경로를 확인할 수 있습니다! 🗺️
