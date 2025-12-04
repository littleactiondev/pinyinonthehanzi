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
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.8; // 천천히
    utterance.pitch = 1;
    
    utterance.onend = () => {
        isSpeaking = false;
        speakBtn.textContent = '🔊 듣기';
    };
    
    utterance.onerror = () => {
        isSpeaking = false;
        speakBtn.textContent = '🔊 듣기';
    };
    
    window.speechSynthesis.speak(utterance);
    isSpeaking = true;
    speakBtn.textContent = '⏸️ 정지';
}

// 중국어 텍스트를 병음과 함께 HTML로 변환
function createPinyinHTML(chineseText) {
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
        // 원문 표시
        inputText.style.display = 'block';
        const pinyinDisplay = document.getElementById('pinyin-display');
        if (pinyinDisplay) {
            pinyinDisplay.style.display = 'none';
        }
        pinyinBtn.textContent = '📖 병음 보기';
        showingPinyin = false;
    }
});

// TTS 버튼 클릭
const speakBtn = document.getElementById('speak-btn');
if (speakBtn) {
    speakBtn.addEventListener('click', () => {
        const text = originalText || inputText.value.trim();
        
        if (!text) {
            showError('중국어를 먼저 입력해주세요');
            return;
        }
        
        hideError();
        
        if (isSpeaking) {
            // 재생 중이면 정지
            window.speechSynthesis.cancel();
            isSpeaking = false;
            speakBtn.textContent = '🔊 듣기';
        } else {
            // 정지 중이면 재생
            speakChinese(text);
        }
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
    translationOutput.innerHTML = '<div class="loading"><div class="spinner"></div><p>번역 중...</p></div>';
    translationOutput.style.display = 'block';
    
    try {
        const targetLang = targetLangSelect.value;
        const translated = await translateText(text, targetLang);
        
        translationOutput.innerHTML = `<p>${translated}</p>`;
    } catch (error) {
        translationOutput.style.display = 'none';
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
