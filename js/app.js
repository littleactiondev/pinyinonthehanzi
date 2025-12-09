// 메인 애플리케이션 로직
import { UI_TEXT } from './constants.js';
import { translateSentences } from './translation.js';
import { createPinyinHTML, createChineseOnlyHTML, createPlainChineseHTML, splitIntoSentences } from './pinyin.js';
import { speakChinese, pauseTTS, resumeTTS, stopTTS, getTTSState, cleanupTTS } from './tts.js';
import { showError, hideError, showSection, createLoadingOverlay } from './ui.js';
import { fetchChineseNews, createNewsHTML } from './news.js';

// DOM 요소
const inputText = document.getElementById('input-text');
const startStudyBtn = document.getElementById('start-study-btn');
const errorDiv = document.getElementById('error');
const newsBtn = document.getElementById('news-btn');
const newsModal = document.getElementById('news-modal');
const closeModal = document.getElementById('close-modal');
const newsContainer = document.getElementById('news-container');

// 상태 관리
let originalText = '';
let currentTranslations = null;

// 학습 모드 상태
let studyMode = {
    showPinyin: false,
    showTranslation: false,
    isPlaying: false,
};

/**
 * 학습 시작
 */
function startStudy() {
    const text = inputText.value.trim();
    
    if (!text) {
        showError(errorDiv, UI_TEXT.ERRORS.NO_INPUT);
        return;
    }
    
    hideError(errorDiv);
    originalText = text;
    
    // 입력 섹션 숨기기
    document.querySelector('.input-section').style.display = 'none';
    
    // 모바일에서 body 스크롤 방지
    document.body.classList.add('study-mode-active');
    
    // 학습 섹션 표시
    const studySection = document.getElementById('study-section');
    const studyContent = document.getElementById('study-content');
    studySection.style.display = 'block';
    
    // 초기 상태: 병음 없이 중국어만 표시
    studyContent.innerHTML = createPlainChineseHTML(text);
    
    // 맨 위로 스크롤
    studyContent.scrollTop = 0;
    
    // 상태 초기화
    studyMode = { showPinyin: false, showTranslation: false, isPlaying: false };
}

/**
 * 병음 토글
 */
function togglePinyin() {
    studyMode.showPinyin = !studyMode.showPinyin;
    updateStudyContent();
    
    const btn = document.getElementById('pinyin-toggle-btn');
    btn.classList.toggle('active', studyMode.showPinyin);
}

/**
 * 번역 토글
 */
function toggleTranslation() {
    if (!studyMode.showTranslation && !currentTranslations) {
        // 번역이 없으면 번역 실행
        translateContent();
    } else {
        studyMode.showTranslation = !studyMode.showTranslation;
        updateStudyContent();
        
        const btn = document.getElementById('translate-toggle-btn');
        btn.classList.toggle('active', studyMode.showTranslation);
    }
}

/**
 * 재생 토글
 */
async function toggleSpeak() {
    const { isSpeaking, isPaused } = getTTSState();
    const btn = document.getElementById('speak-toggle-btn');
    const stopBtn = document.getElementById('stop-speak-btn');
    
    if (isSpeaking && !isPaused) {
        pauseTTS(btn);
        btn.textContent = '▶️ 재생';
    } else if (isPaused) {
        resumeTTS(btn);
        btn.textContent = '⏸️ 일시정지';
        stopBtn.style.display = 'inline-block';
    } else {
        await requestWakeLock(); // 화면 꺼짐 방지
        speakChinese(originalText, btn, stopBtn);
        btn.textContent = '⏸️ 일시정지';
        stopBtn.style.display = 'inline-block';
    }
}

/**
 * 재생 정지
 */
async function stopSpeak() {
    const btn = document.getElementById('speak-toggle-btn');
    const stopBtn = document.getElementById('stop-speak-btn');
    
    stopTTS(btn, stopBtn);
    btn.textContent = '🔊 재생';
    stopBtn.style.display = 'none';
    
    await releaseWakeLock(); // Wake Lock 해제
}

/**
 * 학습 콘텐츠 업데이트
 */
function updateStudyContent() {
    const studyContent = document.getElementById('study-content');
    
    if (studyMode.showPinyin) {
        studyContent.innerHTML = createPinyinHTML(originalText, studyMode.showTranslation ? currentTranslations : null);
    } else {
        studyContent.innerHTML = createChineseOnlyHTML(originalText, studyMode.showTranslation ? currentTranslations : null);
    }
}



/**
 * 번역 실행
 */
async function translateContent() {
    const studyContent = document.getElementById('study-content');
    const btn = document.getElementById('translate-toggle-btn');
    
    // 로딩 표시
    btn.textContent = '번역 중...';
    btn.disabled = true;
    
    try {
        const targetLang = 'ko'; // 기본 한국어
        const sentences = splitIntoSentences(originalText);
        const translations = await translateSentences(sentences, targetLang);
        
        currentTranslations = translations;
        studyMode.showTranslation = true;
        
        updateStudyContent();
        
        btn.textContent = '번역';
        btn.classList.add('active');
        btn.disabled = false;
    } catch (error) {
        showError(errorDiv, UI_TEXT.ERRORS.TRANSLATION_FAILED);
        btn.textContent = '번역';
        btn.disabled = false;
        console.error(error);
    }
}

/**
 * 뉴스 모달 열기
 */
async function openNewsModal() {
    console.log('Opening news modal...');
    newsModal.classList.add('show');
    newsContainer.innerHTML = '<div class="loading"><div class="spinner"></div><p>뉴스를 불러오는 중...</p></div>';
    
    try {
        const newsItems = await fetchChineseNews();
        console.log('News items:', newsItems);
        newsContainer.innerHTML = createNewsHTML(newsItems);
        
        // 뉴스 사용 버튼 이벤트
        document.querySelectorAll('.btn-use-news').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const text = e.target.getAttribute('data-text');
                inputText.value = text;
                closeNewsModal();
            });
        });
    } catch (error) {
        console.error('News error:', error);
        newsContainer.innerHTML = '<p class="no-news">뉴스를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.</p>';
    }
}

/**
 * 뉴스 모달 닫기
 */
function closeNewsModal() {
    console.log('Closing news modal...');
    newsModal.classList.remove('show');
}

/**
 * 첫 화면으로 리셋
 */
function resetToHome() {
    // 입력 초기화
    inputText.value = '';
    
    // 모바일 body 스크롤 복원
    document.body.classList.remove('study-mode-active');
    
    // 입력 섹션 표시
    document.querySelector('.input-section').style.display = 'block';
    
    // 학습 섹션 숨김
    const studySection = document.getElementById('study-section');
    if (studySection) {
        studySection.style.display = 'none';
    }
    
    // 상태 초기화
    originalText = '';
    currentTranslations = null;
    studyMode = { showPinyin: false, showTranslation: false, isPlaying: false };
    
    // TTS 정지
    window.speechSynthesis.cancel();
    
    // 에러 숨김
    hideError(errorDiv);
}

// 이벤트 리스너 등록
if (startStudyBtn) {
    startStudyBtn.addEventListener('click', startStudy);
}

if (newsBtn) {
    newsBtn.addEventListener('click', openNewsModal);
}

if (closeModal) {
    closeModal.addEventListener('click', closeNewsModal);
}

// 학습 모드 버튼들
document.addEventListener('click', (e) => {
    const target = e.target.closest('button');
    if (!target) return;
    
    if (target.id === 'pinyin-toggle-btn') {
        togglePinyin();
    } else if (target.id === 'translate-toggle-btn') {
        toggleTranslation();
    } else if (target.id === 'speak-toggle-btn') {
        toggleSpeak();
    } else if (target.id === 'stop-speak-btn') {
        stopSpeak();
    } else if (target.id === 'back-btn') {
        resetToHome();
    } else if (target.classList.contains('btn-play-sentence')) {
        // 문장별 듣기
        const text = target.getAttribute('data-text');
        if (text) {
            playSentence(text, target);
        }
    }
});

// 현재 재생 중인 문장 버튼 추적
let currentPlayingButton = null;
let wakeLock = null;

/**
 * Wake Lock 요청 (화면 꺼짐 방지)
 */
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock activated');
            
            wakeLock.addEventListener('release', () => {
                console.log('Wake Lock released');
            });
        }
    } catch (err) {
        console.error('Wake Lock error:', err);
    }
}

/**
 * Wake Lock 해제
 */
async function releaseWakeLock() {
    if (wakeLock) {
        try {
            await wakeLock.release();
            wakeLock = null;
        } catch (err) {
            console.error('Wake Lock release error:', err);
        }
    }
}

/**
 * 개별 문장 재생/정지 토글
 */
async function playSentence(text, button) {
    // 같은 버튼을 다시 누르면 정지
    if (currentPlayingButton === button && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        button.textContent = '🔊';
        button.classList.remove('playing');
        currentPlayingButton = null;
        await releaseWakeLock();
        return;
    }
    
    // 다른 문장이 재생 중이면 정지
    if (currentPlayingButton) {
        currentPlayingButton.textContent = '🔊';
        currentPlayingButton.classList.remove('playing');
    }
    
    window.speechSynthesis.cancel();
    await requestWakeLock(); // 화면 꺼짐 방지
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.8;
    utterance.pitch = 1;
    
    // 재생 완료 시
    utterance.onend = async () => {
        button.textContent = '🔊';
        button.classList.remove('playing');
        currentPlayingButton = null;
        await releaseWakeLock();
    };
    
    // 에러 시
    utterance.onerror = async () => {
        button.textContent = '🔊';
        button.classList.remove('playing');
        currentPlayingButton = null;
        await releaseWakeLock();
    };
    
    window.speechSynthesis.speak(utterance);
    button.textContent = '⏸️';
    button.classList.add('playing');
    currentPlayingButton = button;
}

// 타이틀 클릭 시 홈으로
const appTitle = document.getElementById('app-title');
if (appTitle) {
    appTitle.addEventListener('click', resetToHome);
}

// 모달 외부 클릭 시 닫기
newsModal.addEventListener('click', (e) => {
    if (e.target === newsModal) {
        closeNewsModal();
    }
});

// Enter 키로 병음 보기
inputText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        pinyinBtn.click();
    }
});

// 페이지 종료 시 TTS 정지
window.addEventListener('beforeunload', cleanupTTS);

// PWA 서비스 워커 등록 (로컬 개발 시 비활성화)
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//         navigator.serviceWorker.register('/sw.js')
//             .then(() => console.log('Service Worker 등록 완료'))
//             .catch((err) => console.log('Service Worker 등록 실패:', err));
//     });
// }
