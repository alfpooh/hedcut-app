import { useRef, useState } from 'react';

// 긴 변이 maxSize를 넘으면 비율을 유지하며 축소하고 JPEG Blob으로 반환
async function resizeImage(file, maxSize) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
}

export default function App() {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setLoading(true);
    setResultUrl(null);
    setError(null);

    try {
      // 대용량 원본 사진은 API 오류를 유발하므로 업로드 전에 축소한다
      // (브라우저가 디코딩 못하는 포맷이면 원본을 그대로 전송)
      const formData = new FormData();
      try {
        const resized = await resizeImage(file, 1024);
        formData.append('image', resized, 'photo.jpg');
      } catch {
        formData.append('image', file);
      }

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (data.success) {
        setResultUrl(data.url);
      } else {
        setError(data.error || '알 수 없는 오류가 발생했습니다.');
      }
    } catch {
      setError('서버 통신 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2>WSJ 스타일 초상화 변환기</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" ref={fileInputRef} accept="image/*" required />
        <button type="submit" disabled={loading}>변환하기</button>
      </form>

      {loading && <div>처리 중입니다... 잠시만 기다려주세요.</div>}

      <div style={{ marginTop: 20 }}>
        {resultUrl && (
          <>
            <h3>변환 완료!</h3>
            <img
              src={resultUrl}
              alt="Hedcut Portrait"
              style={{ maxWidth: 400, display: 'block', marginBottom: 10 }}
            />
            <a href={resultUrl} target="_blank" rel="noreferrer">이미지 URL 열기</a>
          </>
        )}
        {error && <p style={{ color: 'red' }}>오류: {error}</p>}
      </div>
    </>
  );
}
