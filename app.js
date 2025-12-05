// 병음 변환 함수 (pinyin-pro CDN 사용)

const inputText = document.getElementById('input-text');
const pinyinBtn = document.getElementById('pinyin-btn');
const translateBtn = document.getElementById('translate-btn');
const targetLangSelect = document.getElementById('target-lang');
const outputSection = document.getElementById('output-section');
const translationOutput = document.getElementById('translation-output');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');

let showingPinyin = false;
let originalText = '';
let isSpeaking = false;
let isPaused = false;
let currentUtterance = null;

// 번역 API 호출 (무료) - MyMemory 사용
async function translateText(text, targetLang = 'ko') {
    try {
        // 500자 제한 처리
        if (text.length > 450) {
            // 긴 텍스트는 나눠서 번역
            const chunks = [];
            let currentChunk = '';
            
            // 문장 단위로 나누기
            const sentences = text.match(/[^。！？.!?]+[。！？.!?]*/g) || [text];
            
            for (const sentence of sentences) {
                if ((currentChunk + sentence).length > 450) {
                    if (currentChunk) chunks.push(currentChunk);
                    currentChunk = sentence;
                } else {
                    currentChunk += sentence;
                }
            }
            if (currentChunk) chunks.push(currentChunk);
            
            // 각 청크 번역
            const translations = [];
            for (const chunk of chunks) {
                const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=zh|${targetLang}`;
                const response = await fetch(url);
                const data = await response.json();
                
                if (data.responseData && data.responseData.translatedText) {
                    translations.push(data.responseData.translatedText);
                }
                
                // API 제한 방지를 위한 짧은 대기
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            return translations.join(' ');
        } else {
            // 짧은 텍스트는 바로 번역
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=zh|${targetLang}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.responseData && data.responseData.translatedText) {
                return data.responseData.translatedText;
            } else {
                throw new Error('번역 실패');
            }
        }
    } catch (error) {
        console.error('Translation error:', error);
        throw error;
    }
}

// TTS 음성 재생
function speakChinese(text) {
    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.lang = 'zh-CN';
    currentUtterance.rate = 0.8; // 천천히
    currentUtterance.pitch = 1;
    
    currentUtterance.onend = () => {
        isSpeaking = false;
        isPaused = false;
        speakBtn.textContent = '🔊 재생';
        stopBtn.style.display = 'none';
    };
    
    currentUtterance.onerror = () => {
        isSpeaking = false;
        isPaused = false;
        speakBtn.textContent = '🔊 재생';
        stopBtn.style.display = 'none';
    };
    
    window.speechSynthesis.speak(currentUtterance);
    isSpeaking = true;
    isPaused = false;
    speakBtn.textContent = '⏸️ 일시정지';
    stopBtn.style.display = 'inline-block';
}

// 페이지 종료 시 TTS 정지
window.addEventListener('beforeunload', () => {
    if (isSpeaking) {
        window.speechSynthesis.cancel();
    }
});

// 중국어 텍스트를 병음과 함께 HTML로 변환
function createPinyinHTML(chineseText, translation = null) {
    let html = '';
    
    for (const char of chineseText) {
        // 한자인지 확인
        if (/[\u4e00-\u9fa5]/.test(char)) {
            // pinyin-pro 라이브러리 사용
            const pinyin = window.pinyinPro ? window.pinyinPro.pinyin(char, { toneType: 'symbol' }) : char;
            html += `<ruby>${char}<rt>${pinyin}</rt></ruby>`;
        } else {
            html += char;
        }
    }
    
    // 번역이 있으면 아래에 추가
    if (translation) {
        html += `<div class="translation-below">${translation}</div>`;
    }
    
    return html;
}

// 중국어 텍스트를 병음 없이 같은 스타일로 변환
function createChineseOnlyHTML(chineseText, translation = null) {
    let html = '';
    
    for (const char of chineseText) {
        // 한자인지 확인
        if (/[\u4e00-\u9fa5]/.test(char)) {
            // ruby 태그는 사용하지만 rt는 비워둠 (공간 유지)
            html += `<ruby>${char}<rt style="visibility: hidden;">.</rt></ruby>`;
        } else {
            html += char;
        }
    }
    
    // 번역이 있으면 아래에 추가
    if (translation) {
        html += `<div class="translation-below">${translation}</div>`;
    }
    
    return html;
}

// 병음 보기 버튼 클릭
pinyinBtn.addEventListener('click', () => {
    const text = inputText.value.trim();
    
    if (!text) {
        showError('중국어를 입력해주세요');
        return;
    }
    
    hideError();
    originalText = text;
    
    if (!showingPinyin) {
        // 병음 표시
        const pinyinHTML = createPinyinHTML(text);
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
        pinyinBtn.textContent = '📝 원문 보기';
        showingPinyin = true;
        
        showOutput();
    } else {
        // 원문 표시 (병음만 숨기고 레이아웃 유지)
        const pinyinDisplay = document.getElementById('pinyin-display');
        if (pinyinDisplay) {
            // 기존 번역 추출
            const existingTranslation = pinyinDisplay.querySelector('.translation-below');
            const translationText = existingTranslation ? existingTranslation.textContent : null;
            
            const chineseOnlyHTML = createChineseOnlyHTML(originalText, translationText);
            pinyinDisplay.innerHTML = chineseOnlyHTML;
        }
        pinyinBtn.textContent = '📖 병음 보기';
        showingPinyin = false;
    }
});

// TTS 재생/일시정지 버튼
const speakBtn = document.getElementById('speak-btn');
const stopBtn = document.getElementById('stop-btn');

if (speakBtn) {
    speakBtn.addEventListener('click', () => {
        const text = originalText || inputText.value.trim();
        
        if (!text) {
            showError('중국어를 먼저 입력해주세요');
            return;
        }
        
        hideError();
        
        if (isSpeaking && !isPaused) {
            // 재생 중이면 일시정지
            window.speechSynthesis.pause();
            isPaused = true;
            speakBtn.textContent = '▶️ 재생';
        } else if (isPaused) {
            // 일시정지 중이면 재개
            window.speechSynthesis.resume();
            isPaused = false;
            speakBtn.textContent = '⏸️ 일시정지';
        } else {
            // 정지 중이면 새로 재생
            speakChinese(text);
        }
    });
}

// TTS 정지 버튼
if (stopBtn) {
    stopBtn.addEventListener('click', () => {
        window.speechSynthesis.cancel();
        isSpeaking = false;
        isPaused = false;
        speakBtn.textContent = '🔊 재생';
        stopBtn.style.display = 'none';
    });
}

// 번역 버튼 클릭
translateBtn.addEventListener('click', async () => {
    const text = originalText || inputText.value.trim();
    
    if (!text) {
        showError('중국어를 먼저 입력해주세요');
        return;
    }
    
    hideError();
    
    // 병음 디스플레이에 로딩 표시
    const pinyinDisplay = document.getElementById('pinyin-display');
    if (pinyinDisplay) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'translation-below loading-translation';
        loadingDiv.innerHTML = '<div class="spinner-small"></div> 번역 중...';
        
        // 기존 번역 제거
        const existingTranslation = pinyinDisplay.querySelector('.translation-below');
        if (existingTranslation) {
            existingTranslation.remove();
        }
        
        pinyinDisplay.appendChild(loadingDiv);
    }
    
    try {
        const targetLang = targetLangSelect.value;
        const translated = await translateText(text, targetLang);
        
        // 병음 디스플레이 업데이트
        if (pinyinDisplay) {
            const loadingDiv = pinyinDisplay.querySelector('.loading-translation');
            if (loadingDiv) {
                loadingDiv.remove();
            }
            
            // 현재 병음 상태에 따라 업데이트
            if (showingPinyin) {
                pinyinDisplay.innerHTML = createPinyinHTML(text, translated);
            } else {
                pinyinDisplay.innerHTML = createChineseOnlyHTML(text, translated);
            }
        }
    } catch (error) {
        const loadingDiv = pinyinDisplay?.querySelector('.loading-translation');
        if (loadingDiv) {
            loadingDiv.remove();
        }
        showError('번역 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        console.error(error);
    }
});

// Enter 키로 병음 보기
inputText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        pinyinBtn.click();
    }
});

// UI 헬퍼 함수
function showLoading() {
    loading.style.display = 'block';
}

function hideLoading() {
    loading.style.display = 'none';
}

function showOutput() {
    outputSection.style.display = 'block';
}

function hideOutput() {
    outputSection.style.display = 'none';
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideError() {
    errorDiv.style.display = 'none';
}

// PWA 서비스 워커 등록
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('Service Worker 등록 완료'))
            .catch((err) => console.log('Service Worker 등록 실패:', err));
    });
}
