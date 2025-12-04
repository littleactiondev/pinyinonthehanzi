# 병음 번역기 (Pinyin Translator)

중국어 한자 위에 병음이 바로 표시되는 번역기입니다.

## 특징

- ✅ 한자 위에 병음 표시 (Ruby annotation)
- ✅ 무료 번역 API 사용 (MyMemory)
- ✅ PWA 지원 (모바일 앱처럼 설치 가능)
- ✅ 완전 무료 (서버 비용 없음)
- ✅ 오프라인 지원

## 로컬 실행 방법

1. 간단한 HTTP 서버 실행:

```bash
# Python 3
python -m http.server 8000

# Node.js (http-server 설치 필요)
npx http-server -p 8000
```

2. 브라우저에서 `http://localhost:8000` 접속

## 배포 방법

### GitHub Pages (무료)
1. GitHub 저장소 생성
2. 코드 푸시
3. Settings > Pages > Source를 main 브랜치로 설정

### Vercel (무료)
```bash
npm i -g vercel
vercel
```

### Netlify (무료)
1. netlify.com에서 저장소 연결
2. 자동 배포

## 개선 사항

현재 버전은 기본 한자만 포함되어 있습니다. 더 많은 한자 지원을 위해:

1. **pinyin-pro** 라이브러리 사용 (추천)
2. **pinyin** npm 패키지 사용
3. 온라인 병음 API 추가

## 라이선스

MIT
