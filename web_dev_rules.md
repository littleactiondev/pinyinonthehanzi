# WEB DEVELOPMENT RULES (PWA Project)

병음 학습기 프로젝트의 코드 품질과 유지보수성을 위한 개발 규칙입니다.

## 1. 🚨 FILE SIZE LIMIT (300 Lines)
**모든 소스 코드 파일은 300줄을 넘지 않도록 합니다.**

- **분할 전략:**
  1. **JS 모듈화:** 기능별로 파일 분리 (`app.js` -> `tts.js`, `translation.js`, `pinyin.js`)
  2. **CSS 분리:** 컴포넌트별 스타일 분리 가능
  3. **함수 분리:** 하나의 함수는 최대 50줄 이내

## 2. ♻️ REUSABILITY & MODULARITY (DRY)
**"Don't Repeat Yourself" 원칙 적용**

- **공통 함수 추출:** 반복되는 로직은 별도 함수로 추출
- **상수 관리:** 매직 넘버나 반복되는 문자열은 상수로 정의
- **유틸리티 함수:** 재사용 가능한 헬퍼 함수는 `utils.js`로 분리

## 3. 🏗 ARCHITECTURE
**관심사의 분리 (Separation of Concerns)**

```
├── index.html          # UI 구조
├── style.css           # 스타일링
├── app.js              # 메인 로직 & 이벤트 핸들러
├── api/
│   ├── translation.js  # 번역 API
│   └── pinyin.js       # 병음 변환
├── components/
│   ├── tts.js          # TTS 기능
│   └── ui.js           # UI 헬퍼
└── utils/
    └── helpers.js      # 공통 유틸리티
```

## 4. 💎 CODING STANDARDS

### JavaScript
- **const/let 사용:** `var` 사용 금지
- **명확한 변수명:** `text` 대신 `chineseText`, `translatedText`
- **에러 핸들링:** 모든 비동기 작업에 `try-catch` 필수
- **주석:** 복잡한 로직에는 '왜' 이렇게 했는지 설명

### CSS
- **BEM 방법론:** `.block__element--modifier` 네이밍
- **재사용 가능한 클래스:** `.btn-primary`, `.text-large` 등
- **반응형:** 모바일 우선 설계

### HTML
- **시맨틱 태그:** `<div>` 남용 금지, `<section>`, `<article>` 활용
- **접근성:** `aria-label`, `alt` 속성 필수
- **SEO:** `meta` 태그 최적화

## 5. 📱 PWA BEST PRACTICES
- **오프라인 지원:** Service Worker로 핵심 기능 캐싱
- **반응형 디자인:** 모든 화면 크기 지원
- **성능 최적화:** 이미지 최적화, 지연 로딩
- **설치 가능:** manifest.json 완성도

## 6. 🔒 SECURITY & PERFORMANCE
- **XSS 방지:** `innerHTML` 사용 시 입력값 검증
- **API 키 보호:** 클라이언트 노출 최소화
- **무료 API 제한:** Rate limiting 고려
- **메모리 관리:** 이벤트 리스너 정리

## 7. 📝 DOCUMENTATION
- **README.md:** 프로젝트 설명, 실행 방법, 배포 방법
- **주석:** 복잡한 알고리즘이나 비즈니스 로직 설명
- **변경 이력:** Git commit 메시지 명확하게

## 8. 🧪 TESTING (향후 적용)
- **단위 테스트:** 핵심 함수 테스트
- **통합 테스트:** API 호출 테스트
- **E2E 테스트:** 사용자 시나리오 테스트

---

## 현재 프로젝트 개선 사항

### 즉시 적용 가능:
1. ✅ **app.js 분리** (현재 300줄 초과)
   - `tts.js`: TTS 관련 기능
   - `translation.js`: 번역 API
   - `pinyin.js`: 병음 변환
   - `ui.js`: UI 헬퍼 함수

2. ✅ **상수 분리**
   - `constants.js`: API URL, 언어 코드 매핑 등

3. ✅ **에러 처리 개선**
   - 사용자 친화적 에러 메시지
   - 재시도 로직

4. ✅ **성능 최적화**
   - 디바운싱/쓰로틀링
   - 캐싱 전략

### 향후 고려사항:
- TypeScript 도입
- 빌드 도구 (Vite, Webpack)
- 테스트 프레임워크 (Jest, Vitest)
- CI/CD 파이프라인
