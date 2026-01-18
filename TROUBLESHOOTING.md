# 403 access_denied 오류 해결 가이드

## 원인
Google OAuth 설정이 올바르게 되지 않았을 때 발생합니다.

## 해결 방법 (단계별 체크리스트)

### 1. ✅ Google Calendar API 활성화 확인

1. https://console.cloud.google.com/ 접속
2. 프로젝트 선택
3. 좌측 메뉴 > "API 및 서비스" > "라이브러리"
4. "Google Calendar API" 검색
5. **"사용 설정됨"** 상태인지 확인
   - 만약 "사용 설정" 버튼이 보이면 클릭

---

### 2. ✅ OAuth 동의 화면 설정 확인

1. 좌측 메뉴 > "API 및 서비스" > "OAuth 동의 화면"
2. 다음 항목 확인:

**앱 정보:**
- ✅ 앱 이름: 입력되어 있는지 확인
- ✅ 사용자 지원 이메일: 입력되어 있는지 확인
- ✅ 개발자 연락처: 입력되어 있는지 확인

**범위(Scopes):**
- ✅ ".../auth/calendar.readonly" 또는 ".../auth/calendar.events.readonly" 추가 확인
- 없으면 "범위 추가 또는 삭제" 클릭 후 추가

**테스트 사용자:**
- ✅ **본인의 Gmail 주소가 테스트 사용자로 등록되어 있는지 확인**
  - **이것이 가장 중요합니다!**
  - 없으면 "+ ADD USERS" 클릭 후 본인 Gmail 추가

---

### 3. ✅ 리디렉션 URI 확인

1. 좌측 메뉴 > "API 및 서비스" > "사용자 인증 정보"
2. OAuth 2.0 클라이언트 ID 클릭
3. "승인된 리디렉션 URI" 섹션 확인:

**정확히 일치해야 합니다:**
```
http://localhost:3000/api/auth/callback
```

**주의사항:**
- ❌ `https://` 아님 → `http://`
- ❌ 뒤에 `/` 없어야 함
- ❌ 포트 번호 `3000` 정확히

틀렸으면:
1. "승인된 리디렉션 URI" 삭제
2. 정확히 `http://localhost:3000/api/auth/callback` 입력
3. "저장" 클릭
4. **서버 재시작 필요**

---

### 4. ✅ 앱 게시 상태 확인 (선택사항)

OAuth 동의 화면 > "게시 상태" 확인:
- **테스트 중**: 테스트 사용자만 접근 가능 (권장)
- **프로덕션**: 누구나 접근 가능 (개인 사용은 불필요)

**테스트 중** 상태에서는 반드시 테스트 사용자로 등록된 Gmail만 사용 가능합니다.

---

## 빠른 해결 방법

### 가장 흔한 원인: 테스트 사용자 미등록

1. https://console.cloud.google.com/apis/credentials/consent 접속
2. "테스트 사용자" 섹션 찾기
3. "+ ADD USERS" 클릭
4. **Google Calendar 연동에 사용할 Gmail 주소 입력**
5. "저장" 클릭
6. 다시 시도!

---

## 여전히 안 되면

### 방법 1: 새 OAuth 클라이언트 ID 생성

1. 기존 OAuth 클라이언트 ID 삭제
2. 새로 생성:
   - 애플리케이션 유형: "웹 애플리케이션"
   - 승인된 리디렉션 URI: `http://localhost:3000/api/auth/callback`
3. 새 클라이언트 ID와 Secret을 `.env.local`에 입력
4. 서버 재시작

### 방법 2: 프로젝트 새로 생성

처음부터 다시:
1. Google Cloud Console에서 새 프로젝트 생성
2. SETUP_GUIDE.md의 전체 단계 다시 따라하기

---

## 확인 명령어

서버가 제대로 설정되었는지 확인:

```bash
# .env.local 파일 확인
cat .env.local

# GOOGLE_CLIENT_ID가 실제 값으로 되어 있는지 확인
# demo_client_id가 아닌지 확인
```

---

## 성공적인 설정 예시

.env.local:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-실제시크릿키
```

Google Cloud Console:
- ✅ Calendar API 활성화됨
- ✅ OAuth 동의 화면 설정 완료
- ✅ 테스트 사용자에 본인 Gmail 추가됨
- ✅ 리디렉션 URI: http://localhost:3000/api/auth/callback
- ✅ OAuth 클라이언트 ID 생성됨

이 모든 단계를 확인한 후 다시 시도해보세요!
