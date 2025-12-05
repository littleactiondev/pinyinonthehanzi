// TTS (Text-to-Speech) 관련 기능
import { TTS_CONFIG, UI_TEXT } from './constants.js';

// TTS 상태 관리
let isSpeaking = false;
let isPaused = false;
let currentUtterance = null;

/**
 * TTS 상태 가져오기
 */
export function getTTSState() {
    return { isSpeaking, isPaused };
}

/**
 * 중국어 음성 재생
 * @param {string} text - 읽을 중국어 텍스트
 * @param {HTMLElement} speakBtn - 재생 버튼 요소
 * @param {HTMLElement} stopBtn - 정지 버튼 요소
 */
export function speakChinese(text, speakBtn, stopBtn) {
    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.lang = TTS_CONFIG.LANG;
    currentUtterance.rate = TTS_CONFIG.RATE;
    currentUtterance.pitch = TTS_CONFIG.PITCH;
    
    currentUtterance.onend = () => {
        isSpeaking = false;
        isPaused = false;
        speakBtn.textContent = UI_TEXT.BUTTONS.SPEAK_PLAY;
        stopBtn.style.display = 'none';
    };
    
    currentUtterance.onerror = () => {
        isSpeaking = false;
        isPaused = false;
        speakBtn.textContent = UI_TEXT.BUTTONS.SPEAK_PLAY;
        stopBtn.style.display = 'none';
    };
    
    window.speechSynthesis.speak(currentUtterance);
    isSpeaking = true;
    isPaused = false;
    speakBtn.textContent = UI_TEXT.BUTTONS.SPEAK_PAUSE;
    stopBtn.style.display = 'inline-block';
}

/**
 * TTS 일시정지
 * @param {HTMLElement} speakBtn - 재생 버튼 요소
 */
export function pauseTTS(speakBtn) {
    window.speechSynthesis.pause();
    isPaused = true;
    speakBtn.textContent = UI_TEXT.BUTTONS.SPEAK_RESUME;
}

/**
 * TTS 재개
 * @param {HTMLElement} speakBtn - 재생 버튼 요소
 */
export function resumeTTS(speakBtn) {
    window.speechSynthesis.resume();
    isPaused = false;
    speakBtn.textContent = UI_TEXT.BUTTONS.SPEAK_PAUSE;
}

/**
 * TTS 완전 정지
 * @param {HTMLElement} speakBtn - 재생 버튼 요소
 * @param {HTMLElement} stopBtn - 정지 버튼 요소
 */
export function stopTTS(speakBtn, stopBtn) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    isPaused = false;
    speakBtn.textContent = UI_TEXT.BUTTONS.SPEAK_PLAY;
    stopBtn.style.display = 'none';
}

/**
 * 페이지 종료 시 TTS 정리
 */
export function cleanupTTS() {
    if (isSpeaking) {
        window.speechSynthesis.cancel();
    }
}
