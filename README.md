# Rocket Alpha UI

`C:\rocket-alpha-ui`는 Rocket Alpha 프론트엔드들이 공통으로 사용하는 공유 UI/유틸 패키지다.

## 역할

- 인증 API 클라이언트 export
- 공통 포맷 유틸 export
- 패널/메뉴 관련 유틸 export
- PWA service worker 등록 함수 export
- 공유 앱 셸 컴포넌트 export

## 현재 상태

- 이 패키지는 독립 실행 서버가 아니다.
- `rocket-alpha-admin-fe`와 `rocket-alpha-cus-fe`의 build context에 포함되어 사용된다.
- 별도 docker compose나 장기 실행 프로세스는 없다.

## exports

- `./auth`
- `./format`
- `./panels`
- `./pwa`
- `./SharedAppShell.vue`

## 사용 위치

- `C:\rocket-alpha-admin-fe`
- `C:\rocket-alpha-cus-fe`

## start/stop 스크립트

- `start.ps1`: 패키지 상태 확인용 no-op 스크립트
- `stop.ps1`: 중지 대상이 없음을 알리는 no-op 스크립트

## 서비스 재기동 순서

| 순서 | 대상 | 설명 |
|---|---|---|
| 1 | `rocket-alpha-ui` 수정 | 단독 재기동 대상 아님 |
| 2 | consumer rebuild | `rocket-alpha-admin-fe` 또는 `rocket-alpha-cus-fe` 재빌드 필요 |
| 3 | gateway 확인 | 통합 경로 검증 시 `rocket-gw` 뒤에서 확인 |

예시:

```powershell
cd C:\rocket-alpha-admin-fe
.\stop.ps1
.\start.ps1
```

또는:

```powershell
cd C:\rocket-alpha-cus-fe
.\stop.ps1
.\start.ps1
```

## 참고

- `src/pwa.ts`는 `BASE_URL` 기준으로 service worker를 등록한다.
- 현재 정책은 `localhost` / `127.0.0.1` / `::1` 같은 local/integrated 환경에서는 기본적으로 service worker를 등록하지 않고, 기존 scope 등록도 해제한다.
- 비로컬 환경에서만 기본 등록되며, 필요하면 `VITE_ENABLE_SERVICE_WORKER=true|false`로 강제할 수 있다.
