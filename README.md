# Hedcut App

사진을 업로드하면 나노바나나(Google Gemini 이미지 모델)로 월스트리트저널(WSJ) 스타일의 점묘 헤드컷 초상화로 변환하고, 결과를 [ImageKit.io](https://imagekit.io)에 저장하는 웹 앱입니다.

## 동작 방식

1. 브라우저에서 사진 업로드 (업로드 전 클라이언트에서 최대 1024px로 축소)
2. 서버가 Gemini API(`gemini-2.5-flash-image`)로 헤드컷 스타일 변환 요청 (일시적 오류 시 최대 3회 재시도)
3. 생성된 이미지를 ImageKit `/hedcut_portraits` 폴더에 업로드
4. 최종 이미지 URL을 화면에 표시

## 실행 방법

```bash
npm install
cp .env.example .env   # 각 API 키를 채워넣으세요
node server.js
```

브라우저에서 `http://localhost:3000` 접속.

## 환경변수

| 변수 | 설명 |
|------|------|
| `PORT` | 서버 포트 (기본 3000) |
| `NANOBANANA_API_KEY` | Google Gemini API 키 ([AI Studio](https://aistudio.google.com/apikey)에서 발급) |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit 퍼블릭 키 |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit 프라이빗 키 |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL 엔드포인트 |

`.env`는 커밋되지 않습니다. `.env.example`을 참고해 직접 만들어주세요.
