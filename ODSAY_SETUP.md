# ODsay 대중교통 API 설정 가이드

이 앱에서 대중교통 경로를 표시하려면 ODsay API 키가 필요합니다.

## ODsay API 키 발급받기

### 1. ODsay LAB 회원가입

1. [ODsay LAB](https://lab.odsay.com/) 접속
2. 우측 상단 **회원가입** 클릭
3. 필요한 정보 입력 및 가입 완료

### 2. API 키 발급

1. 로그인 후 상단 메뉴에서 **API 신청** 클릭
2. **API 키 발급** 버튼 클릭
3. 서비스 이름, 용도 등 필요한 정보 입력
   - **서비스명**: Arrival Assistant (또는 원하는 이름)
   - **서비스 URL**: http://localhost:3000
   - **서비스 설명**: 개인용 약속 알림 서비스
4. 신청 후 즉시 API 키 발급 (무료)

### 3. API 키 등록

발급받은 API 키를 `.env.local` 파일에 추가합니다:

```bash
# ODsay 대중교통 API (https://lab.odsay.com 에서 발급받으세요)
ODSAY_API_KEY=발급받은_API_키를_여기에_입력
```

### 4. 서버 재시작

터미널에서 개발 서버를 재시작합니다:

```bash
# Ctrl+C로 서버 중지 후
npm run dev
```

## 사용량 제한

- **무료 플랜**: 일 10,000회 요청
- 개인 사용에는 충분한 무료 제공량

## API 기능

ODsay API는 다음 정보를 제공합니다:

- ✅ 지하철 경로 (노선, 환승, 소요시간)
- ✅ 버스 경로 (노선번호, 정류장)
- ✅ 환승 정보
- ✅ 도보 거리
- ✅ 요금 정보

## 문제 해결

### API 키가 작동하지 않는 경우

1. `.env.local` 파일에서 API 키가 올바르게 입력되었는지 확인
2. 개발 서버를 재시작했는지 확인
3. ODsay LAB 사이트에서 API 키 상태 확인 (활성화 여부)

### 경로가 표시되지 않는 경우

1. 브라우저 개발자 도구(F12) → Console 탭에서 에러 메시지 확인
2. 서버 터미널에서 ODsay API 호출 로그 확인
3. 주소가 정확한지 확인 (Google Calendar에 입력된 장소)

## 참고 문서

- [ODsay LAB 공식 가이드](https://lab.odsay.com/guide/guide)
- [API 사용 예제](https://velog.io/@leesanghuu/ODsay-API를-활용한-대중교통-길찾기)
