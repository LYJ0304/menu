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
`vercel.json`의 Cron은 매일 UTC 00:00(한국시간 09:00)로 설정되어 있습니다.

## 검사

```bash
npm run lint
npm run typecheck
npm test
npm run build
```
