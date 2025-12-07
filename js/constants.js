// 상수 정의
export const API_CONFIG = {
    TRANSLATION_URL: 'https://api.mymemory.translated.net/get',
    TRANSLATION_DELAY: 300, // API 제한 방지 대기 시간 (ms)
};

export const NEWS_CONFIG = {
    // 여러 RSS 소스 (하나 실패하면 다음 시도)
    RSS_FEEDS: [
        'https://cn.nytimes.com/rss/zh-hans/', // 뉴욕타임스 중문판
        'https://feedx.net/rss/people.xml', // 인민일보 (프록시)
        'https://rsshub.app/bbc/chinese', // BBC 중문
    ],
    RSS_TO_JSON_API: 'https://api.rss2json.com/v1/api.json',
    API_KEY: 'public',
    COUNT: 15,
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
        PINYIN_SHOW: '📖 읽기',
        PINYIN_HIDE: '📝 원문 보기',
        SPEAK_PLAY: '🔊 재생',
        SPEAK_PAUSE: '⏸️ 일시정지',
        SPEAK_RESUME: '▶️ 재생',
        SPEAK_STOP: '⏹️ 정지',
    },
};
