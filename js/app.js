// 메인 애플리케이션 로직
import { UI_TEXT } from './constants.js';
import { translateSentences } from './translation.js';
import { createPinyinHTML, createChineseOnlyHTML, splitIntoSentences } from './pinyin.js';
import { speakChinese, pauseTTS, resumeTTS, stopTTS, getTTSState, cleanupTTS } from './tts.js';
import { showError, hideError, showSection, createLoadingOverlay } from './ui.js';
import { fetchChineseNews, createNewsHTML } from './news.js';

// DOM 요소
const inputText = document.getElementById('input-text');
const pinyinBtn = document.getElementById('pinyin-btn');
const speakBtn = document.getElementById('speak-btn');
const stopBtn = document.getElementById('stop-btn');
const translateBtn = document.getElementById('translate-btn');
const targetLangSelect = document.getElementById('target-lang');
const outputSection = document.getElementById('output-section');
const errorDiv = document.getElementById('error');
const newsBtn = document.getElementById('news-btn');
const newsModal = document.getElementById('news-modal');
const closeModal = document.getElementById('close-modal');
const newsContainer = document.getElementById('news-container');

// 상태 관리
let showingPinyin = false;
let originalText = '';
let currentTranslations = null;

/**
 * 병음 보기/원문 보기 토글
 */
function togglePinyin() {
    const text = inputText.value.trim();
    
    if (!text) {
        showError(errorDiv, UI_TEXT.ERRORS.NO_INPUT);
        return;
    }
    
    hideError(errorDiv);
    originalText = text;
    
    if (!showingPinyin) {
        // 병음 표시
        const pinyinHTML = createPinyinHTML(text, currentTranslations);
        inputText.style.display = 'none';
        
        // 병음 출력 영역 생성
        let pinyinDisplay = document.getElementById('pinyin-display');
        if (!pinyinDisplay) {
            pinyinDisplay = document.createElement('div');
            pinyinDisplay.id = 'pinyin-display';
            pinyinDisplay.className = 'pinyin-output';
            inputText.parentNode.insertBefore(pinyinDisplay, inputText.nextSibling);
        }
        
        pinyinDisplay.innerHTML = pinyinHTML;
        pinyinDisplay.style.display = 'block';
        pinyinBtn.textContent = UI_TEXT.BUTTONS.PINYIN_HIDE;
        showingPinyin = true;
        
        showSection(outputSection);
    } else {
        // 원문 표시 (병음만 숨기고 레이아웃 유지)
        const pinyinDisplay = document.getElementById('pinyin-display');
        if (pinyinDisplay) {
            const chineseOnlyHTML = createChineseOnlyHTML(originalText, currentTranslations);
            pinyinDisplay.innerHTML = chineseOnlyHTML;
        }
        pinyinBtn.textContent = UI_TEXT.BUTTONS.PINYIN_SHOW;
        showingPinyin = false;
    }
}

/**
 * TTS 재생/일시정지 토글
 */
function toggleSpeak() {
    const text = originalText || inputText.value.trim();
    
    if (!text) {
        showError(errorDiv, UI_TEXT.ERRORS.NO_TEXT_FOR_SPEAK);
        return;
    }
    
    hideError(errorDiv);
    
    const { isSpeaking, isPaused } = getTTSState();
    
    if (isSpeaking && !isPaused) {
        // 재생 중이면 일시정지
        pauseTTS(speakBtn);
    } else if (isPaused) {
        // 일시정지 중이면 재개
        resumeTTS(speakBtn);
    } else {
        // 정지 중이면 새로 재생
        speakChinese(text, speakBtn, stopBtn);
    }
}

/**
 * TTS 정지
 */
function handleStop() {
    stopTTS(speakBtn, stopBtn);
}

/**
 * 번역 실행
 */
async function handleTranslate() {
    const text = originalText || inputText.value.trim();
    
    if (!text) {
        showError(errorDiv, UI_TEXT.ERRORS.NO_TEXT_FOR_SPEAK);
        return;
    }
    
    hideError(errorDiv);
    
    const pinyinDisplay = document.getElementById('pinyin-display');
    if (!pinyinDisplay) return;
    
    // 로딩 표시
    const loadingOverlay = createLoadingOverlay();
    pinyinDisplay.appendChild(loadingOverlay);
    
    try {
        const targetLang = targetLangSelect.value;
        
        // 문장 단위로 나누기
        const sentences = splitIntoSentences(text);
        
        // 각 문장 번역
        const translations = await translateSentences(sentences, targetLang);
        
        // 로딩 제거
        loadingOverlay.remove();
        
        // 현재 병음 상태에 따라 업데이트
        if (showingPinyin) {
            pinyinDisplay.innerHTML = createPinyinHTML(text, translations);
        } else {
            pinyinDisplay.innerHTML = createChineseOnlyHTML(text, translations);
        }
        
        currentTranslations = translations;
    } catch (error) {
        loadingOverlay.remove();
        showError(errorDiv, UI_TEXT.ERRORS.TRANSLATION_FAILED);
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

// 이벤트 리스너 등록
pinyinBtn.addEventListener('click', togglePinyin);
speakBtn.addEventListener('click', toggleSpeak);
stopBtn.addEventListener('click', handleStop);
translateBtn.addEventListener('click', handleTranslate);
newsBtn.addEventListener('click', openNewsModal);
closeModal.addEventListener('click', closeNewsModal);

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

// PWA 서비스 워커 등록
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('Service Worker 등록 완료'))
            .catch((err) => console.log('Service Worker 등록 실패:', err));
    });
}
