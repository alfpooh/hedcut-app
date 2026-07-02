# Hedcut App

사진을 업로드하면 나노바나나(Google Gemini 이미지 모델)로 월스트리트저널(WSJ) 스타일의 점묘 헤드컷 초상화로 변환하고, 결과를 [ImageKit.io](https://imagekit.io)에 저장하는 웹 앱입니다.

## 구조

- `server.js` — Express API 서버 (포트 3000 고정). `/api/convert` 엔드포인트만 담당.
- `client/` — React(Vite) 프론트엔드. 개발 중에는 `/api` 요청을 `vite.config.js`의 프록시 설정으로 백엔드(3000번 포트)에 전달한다.

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

## 환경변수

| 변수 | 설명 |
|------|------|
| `PORT` | 서버 포트 (기본 3000) |
| `NANOBANANA_API_KEY` | Google Gemini API 키 ([AI Studio](https://aistudio.google.com/apikey)에서 발급) |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit 퍼블릭 키 |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit 프라이빗 키 |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL 엔드포인트 |

`.env`는 커밋되지 않습니다. `.env.example`을 참고해 직접 만들어주세요.
