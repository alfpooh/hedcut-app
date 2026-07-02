const serverless = require('serverless-http');
const app = require('../../app');

// Gemini 이미지 생성은 수십 초가 걸릴 수 있어 함수 실행 자체는 오래 유지되어야 하지만,
// Netlify 무료 플랜의 동기 함수 실행시간 제한(기본 10초)은 여기서 늘릴 수 없다.
// 유료 플랜이거나 타임아웃이 계속 발생하면 별도 백엔드 호스팅으로 전환을 고려할 것.
module.exports.handler = serverless(app);
