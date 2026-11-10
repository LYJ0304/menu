# Menu

## 요구 환경

- Node.js 22
- npm 10 이상
- PostgreSQL(Neon 권장)

## 로컬 실행

```bash
nvm use
npm ci
cp .env.example .env.local
npm run dev
```

<http://localhost:3000>에서 홈 화면을 확인합니다.
DB·카카오 환경변수가 없어도 홈 화면은 실행됩니다.

## 환경변수

| 변수 | 설정 |
| --- | --- |
| `DATABASE_URL` | Neon 대시보드의 pooled PostgreSQL 연결 문자열. SSL 옵션 유지 |
| `DATABASE_URL_UNPOOLED` | migration용 direct 연결 문자열. Neon CLI가 내려주는 값 사용 |
| `CSV_DOWNLOAD_URL` | 국방부 CSV 주소: `https://opendata.mnd.go.kr/openinf/opencom/down2csv.jsp` |
| `CRON_SECRET` | 수집 API 인증용 값. `openssl rand -base64 32`로 생성 |
| `NEXTAUTH_URL` | 로컬: `http://localhost:3000`, 운영: 실제 HTTPS 주소 |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32`로 생성한 임의 값 |
| `KAKAO_CLIENT_ID` | Kakao Developers 앱의 REST API 키 |
| `KAKAO_CLIENT_SECRET` | 카카오 로그인 보안 설정의 Client Secret. 활성화 필요 |

Kakao Developers에서 카카오 로그인을 활성화하고 Redirect URI를 등록합니다.

```text
http://localhost:3000/api/auth/callback/kakao
https://<운영 도메인>/api/auth/callback/kakao
```

설정 후 `/api/auth/signin`에서 로그인할 수 있습니다.
환경변수와 실제 자격 증명은 Git에 올리지 않습니다.

## DB 설정

Neon CLI로 지정 프로젝트에 연결하고 DB 환경변수를 내려받습니다.

```bash
neon login
neon init -y --org-id org-late-shadow-26599577 --project-id square-shadow-99151836 --branch production --services postgres
neon deploy
```

`neon.ts`는 Postgres 서비스 구성을 관리합니다. `.neon`과 실제 연결 문자열이 담긴 `.env.local`은 Git에서 제외됩니다.
앱은 `DATABASE_URL`을 사용하고, migration은 `DATABASE_URL_UNPOOLED`를 우선 사용합니다.

`DATABASE_URL`을 설정하고 포함된 migration을 적용합니다.

```bash
npm run db:migrate
```

스키마 변경 후에는 `npm run db:generate`로 migration을 생성합니다.

## 식단 수집 설정

`.env.local`에 `CSV_DOWNLOAD_URL`과 `CRON_SECRET`을 설정합니다.
수집 대상은 제9030부대(`OA-9561`)입니다.
로컬 서버 실행 후 아래 명령으로 수집을 실행합니다. `CRON_SECRET`은 셸에도 설정해야 합니다.

```bash
curl --fail-with-body -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/import-csv
```

Vercel에 배포할 때도 `DATABASE_URL`, `CSV_DOWNLOAD_URL`, `CRON_SECRET`을 등록합니다.

### GitHub Actions 설정

GitHub 저장소의 **Settings → Secrets and variables → Actions**에 등록합니다.

| 구분 | 이름 | 값 |
| --- | --- | --- |
| Variables | `APP_URL` | 운영 사이트의 HTTPS 주소. 리다이렉트되지 않는 주소 사용 |
| Secrets | `CRON_SECRET` | Vercel Production의 `CRON_SECRET`과 동일한 값 |
| Secrets (선택) | `VERCEL_AUTOMATION_BYPASS_SECRET` | Vercel Deployment Protection이 적용된 경우 자동화 우회용 값 |

GitHub Actions에는 DB 연결 문자열이나 Neon 비밀번호를 등록하지 않습니다. 수집과 DB 저장은 Vercel의 인증된 `/api/cron/import-csv` API가 처리합니다.

`.github/workflows/sync-9030-meals.yml`은 `military-info`와 동일하게 매일 한국시간 **06:00**에 실행됩니다. 수동 실행은 **Actions → Sync 9030 meals → Run workflow**를 사용합니다. 동일 워크플로의 동시 실행은 제한하며, 이미 처리한 CSV는 기존 체크섬 검증으로 건너뜁니다.

예약 실행은 워크플로가 기본 브랜치에 반영된 뒤 활성화되고, GitHub 상황에 따라 지연될 수 있습니다. 기존 Vercel Cron은 제거했으므로 중복 스케줄 제거도 운영 배포에 반영해야 합니다.

## 방문 통계

루트 레이아웃의 `@vercel/analytics/next`로 Vercel Web Analytics를 연결합니다.
Vercel 프로젝트의 **Analytics → Enable**을 활성화한 뒤 배포하면 방문 통계를 확인할 수 있습니다.

## 전역일 카운트다운

상단 메뉴의 `카운트다운`(`/countdown`)에서 입대일과 전역일을 입력하면 D-day, 남은 일·시간·분·초,
소수점 여섯 자리 복무율과 진행 막대를 표시합니다. 날짜는 이 브라우저에만
저장하며, `날짜 수정`에서 변경하거나 초기화할 수 있습니다.

입대일과 전역일은 한국시간 00:00 기준입니다. D-day는 한국 날짜 차이로
계산하고, 남은 시간과 복무율은 실제 시각 차이로 계산합니다. 전역 당일부터
D-0·남은 시간 0·복무율 100%를 표시합니다. 비활성 탭에서는 타이머를 멈추고
복귀 즉시 다시 계산하며, 시간 갱신을 위한 서버 요청은 하지 않습니다.

기존 전역 카운트다운 아래에는 남은 출근일을 표시합니다. 한국시간 기준 오늘부터
전역일 전날까지의 날짜에서 토·일요일과 대한민국 공휴일·대체공휴일을 제외합니다.
입대 전에는 입대일부터 계산하며 전역일부터는 0일입니다. 음력 설·추석 연휴는
전체 기간을 제외하고, 선거일·임시공휴일은 별도로 관리합니다. 추후 지정되는
임시공휴일이나 공휴일 제도 변경은 달력 데이터 업데이트가 필요합니다.

데스크톱에서는 왼쪽에 카운트다운, 오른쪽에 복무 날짜와 남은 연가·포상휴가·위로휴가·전투휴무를
배치합니다. 모바일에서는 세로로 표시합니다. `휴가 수정`에서 평일에 사용할 남은
휴가 일수를 각각 입력하면 브라우저에 저장하고, 이를 차감한 예상 출근일도 표시합니다.
휴가는 주말·공휴일과 겹치지 않는 것으로 가정하며 예상 출근일은 0일 미만이 되지 않습니다.

## 검사

```bash
npm run lint
npm run typecheck
npm test
npm run build
```
