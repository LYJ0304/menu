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

`DATABASE_URL`을 설정하고 `src/lib/db/schema.ts`에 테이블을 정의한 뒤 실행합니다.

```bash
npm run db:generate
npm run db:migrate
```
## 검사

```bash
npm run lint
npm run typecheck
npm test
npm run build
```
