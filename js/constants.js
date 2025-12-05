// 상수 정의
export const API_CONFIG = {
    TRANSLATION_URL: 'https://api.mymemory.translated.net/get',
    TRANSLATION_DELAY: 300, // API 제한 방지 대기 시간 (ms)
};

export const NEWS_CONFIG = {
    RSS_FEED: 'http://www.people.com.cn/rss/world.xml', // 인민일보 국제뉴스
    RSS_TO_JSON_API: 'https://api.rss2json.com/v1/api.json',
    API_KEY: 'public', // 무료 버전
    COUNT: 10, // 가져올 기사 수
};

export const TTS_CONFIG = {
    LANG: 'zh-CN',
    RATE: 0.8, // 천천히
    PITCH: 1,
};

export const UI_TEXT = {
    ERRORS: {
        NO_INPUT: '중국어를 입력해주세요',
        NO_TEXT_FOR_SPEAK: '중국어를 먼저 입력해주세요',
        TRANSLATION_FAILED: '번역 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    },
    BUTTONS: {
        PINYIN_SHOW: '📖 병음 보기',
        PINYIN_HIDE: '📝 원문 보기',
        SPEAK_PLAY: '🔊 재생',
        SPEAK_PAUSE: '⏸️ 일시정지',
        SPEAK_RESUME: '▶️ 재생',
        SPEAK_STOP: '⏹️ 정지',
    },
};
