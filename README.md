# Hedcut App

사진을 업로드하면 나노바나나(Google Gemini 이미지 모델)로 월스트리트저널(WSJ) 스타일의 점묘 헤드컷 초상화로 변환하고, 결과를 [ImageKit.io](https://imagekit.io)에 저장하는 웹 앱입니다.

## 구조

- `app.js` — Express 앱 정의 (`/api/convert` 라우트, 미들웨어). 로컬 실행과 Netlify Function 양쪽에서 공유한다.
- `server.js` — `app.js`를 포트 3000에서 실행하는 로컬/전통적 Node 호스팅용 진입점.
- `netlify/functions/api.js` — `app.js`를 `serverless-http`로 감싼 Netlify Function. Netlify 배포 시 이 함수가 API를 담당한다.
- `client/` — React(Vite) 프론트엔드. 로컬 개발 중에는 `/api` 요청을 `vite.config.js`의 프록시 설정으로 백엔드(3000번 포트)에 전달한다.
- `netlify.toml` — Netlify 빌드/리다이렉트 설정 (`/api/*` → Netlify Function, 나머지 → SPA `index.html`).

## 동작 방식

1. 브라우저에서 사진 업로드 (업로드 전 클라이언트에서 최대 1024px로 축소)
2. 서버가 Gemini API(`gemini-2.5-flash-image`)로 헤드컷 스타일 변환 요청 (일시적 오류 시 최대 3회 재시도)
3. 생성된 이미지를 ImageKit `/hedcut_portraits` 폴더에 업로드
4. 최종 이미지 URL을 화면에 표시

## 개발 환경 실행

```bash
npm install
cp .env.example .env   # 각 API 키를 채워넣으세요

# 터미널 1: 백엔드 (포트 3000 고정)
npm run server

# 터미널 2: 프론트엔드 (Vite, 기본 5173)
npm run client
```

브라우저에서 `http://localhost:5173` 접속 (백엔드 포트인 3000이 아님에 유의).

## 프로덕션 빌드

```bash
npm run build   # client/dist 생성
npm start       # Express가 client/dist를 정적으로 서빙 + API 제공, 단일 프로세스로 http://localhost:3000
```

## Netlify 배포

이 저장소는 `netlify.toml`을 통해 프론트엔드(정적 빌드)와 백엔드(Netlify Function)를 함께 배포하도록 구성되어 있다.

1. Netlify에서 이 저장소를 새 사이트로 연결한다 (Build settings는 `netlify.toml`이 자동으로 채워준다).
2. **Site settings → Environment variables**에 아래 환경변수를 등록한다 (`.env`는 커밋되지 않으므로 반드시 Netlify 대시보드에 직접 입력해야 한다):
   - `NANOBANANA_API_KEY`
   - `IMAGEKIT_PUBLIC_KEY`
   - `IMAGEKIT_PRIVATE_KEY`
   - `IMAGEKIT_URL_ENDPOINT`
3. 배포하면 `/api/*` 요청은 `netlify/functions/api.js` (Netlify Function)로, 그 외 경로는 React 앱(`client/dist`)으로 라우팅된다.

> **주의:** Netlify 무료 플랜의 동기 함수는 기본 실행시간 제한이 10초다. Gemini 이미지 생성은 상황에 따라 10~20초 이상 걸릴 수 있어 간헐적으로 함수 타임아웃이 발생할 수 있다. 자주 발생하면 Netlify 유료 플랜(실행시간 26초)으로 올리거나, 백엔드를 Render/Railway 같은 별도 Node 호스팅으로 옮기고 프론트엔드에서 그 주소를 호출하도록 전환하는 것을 고려한다.

## 환경변수

| 변수 | 설명 |
|------|------|
| `PORT` | 서버 포트 (기본 3000) |
| `NANOBANANA_API_KEY` | Google Gemini API 키 ([AI Studio](https://aistudio.google.com/apikey)에서 발급) |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit 퍼블릭 키 |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit 프라이빗 키 |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL 엔드포인트 |

`.env`는 커밋되지 않습니다. `.env.example`을 참고해 직접 만들어주세요.
