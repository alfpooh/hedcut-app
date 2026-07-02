require('dotenv').config();
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const ImageKit = require('imagekit');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// ImageKit 초기화
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

app.use(express.json());

// 이미지 처리 API 엔드포인트
app.post('/api/convert', upload.single('image'), async (req, res) => {
    console.log(`[${new Date().toISOString()}] /api/convert 요청: ${req.file ? `${req.file.mimetype}, ${Math.round(req.file.size / 1024)}KB` : '파일 없음'}`);
    try {
        if (!req.file) {
            return res.status(400).json({ error: '이미지 파일이 필요합니다.' });
        }

        const base64Image = req.file.buffer.toString('base64');
        const prompt = "Transform this photo into a professional stippled hedcut portrait in the iconic Wall Street Journal style: fine black ink dots and cross-hatching lines, plain white background, high contrast. Keep the person's face shape and body proportions faithful to the original photo, without making them look heavier or distorted.";

        // 1. 나노바나나(Gemini 이미지 모델) API 호출
        // 429/500/503은 일시적 오류인 경우가 많아 백오프를 두고 재시도한다
        let geminiResponse;
        const maxAttempts = 3;
        for (let attempt = 1; ; attempt++) {
            try {
                geminiResponse = await axios.post(
                    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent',
                    {
                        contents: [{
                            parts: [
                                { text: prompt },
                                {
                                    inline_data: {
                                        mime_type: req.file.mimetype,
                                        data: base64Image
                                    }
                                }
                            ]
                        }]
                    },
                    {
                        headers: {
                            'x-goog-api-key': process.env.NANOBANANA_API_KEY,
                            'Content-Type': 'application/json'
                        },
                        timeout: 120000
                    }
                );
                break;
            } catch (err) {
                const status = err.response?.status;
                const retryable = [429, 500, 503].includes(status);
                console.error(`Gemini 호출 실패 (시도 ${attempt}/${maxAttempts}, status ${status}):`,
                    JSON.stringify(err.response?.data?.error || err.message).slice(0, 300));
                if (!retryable || attempt >= maxAttempts) throw err;
                await new Promise(r => setTimeout(r, attempt * 3000));
            }
        }

        // 응답 파트 중 이미지(inlineData)가 담긴 파트를 찾음
        const parts = geminiResponse.data?.candidates?.[0]?.content?.parts || [];
        const imagePart = parts.find(p => p.inlineData?.data);
        if (!imagePart) {
            console.error('Gemini 응답에 이미지가 없습니다:', JSON.stringify(geminiResponse.data).slice(0, 500));
            return res.status(502).json({ success: false, error: '이미지 생성에 실패했습니다. 다른 사진으로 시도해보세요.' });
        }
        const generatedImageBase64 = imagePart.inlineData.data;
        const ext = (imagePart.inlineData.mimeType || 'image/png').split('/')[1];

        // 2. ImageKit.io에 업로드
        const uploadResponse = await imagekit.upload({
            file: generatedImageBase64, // base64 문자열
            fileName: `hedcut_${Date.now()}.${ext}`,
            folder: "/hedcut_portraits"
        });

        // 3. 최종 URL 클라이언트에 반환
        console.log(`[${new Date().toISOString()}] 변환 성공: ${uploadResponse.url}`);
        res.json({ success: true, url: uploadResponse.url });

    } catch (error) {
        // axios 에러면 상대 API가 보낸 응답 본문을 그대로 로그에 남김
        console.error(error.response?.data || error.message || error);
        const status = error.response?.status;
        let message = '이미지 처리 중 오류가 발생했습니다.';
        if (status === 429) {
            message = 'API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
        } else if (status === 500 || status === 503) {
            message = 'AI 서버가 일시적으로 불안정합니다. 잠시 후 다시 시도해주세요.';
        }
        res.status(500).json({ success: false, error: message });
    }
});

// 전통적인 Node 호스팅(Render, Railway 등)에서는 React 빌드 결과물(client/dist)을
// 이 서버가 직접 정적으로 서빙할 수 있다. Netlify Functions 환경에서는 이 폴더가
// 함께 배포되지 않으므로 이 블록은 조용히 스킵된다 (정적 파일은 Netlify가 별도로 서빙).
const clientDist = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    // SPA 라우팅: /api가 아닌 나머지 GET 요청은 index.html로 위임
    app.use((req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

module.exports = app;
