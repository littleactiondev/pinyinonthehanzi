// 번역 API 관련 기능
import { API_CONFIG } from './constants.js';

/**
 * 단일 텍스트 번역
 * @param {string} text - 번역할 중국어 텍스트
 * @param {string} targetLang - 목표 언어 코드
 * @returns {Promise<string>} 번역된 텍스트
 */
export async function translateText(text, targetLang = 'ko') {
    try {
        const url = `${API_CONFIG.TRANSLATION_URL}?q=${encodeURIComponent(text)}&langpair=zh|${targetLang}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.responseData && data.responseData.translatedText) {
            return data.responseData.translatedText;
        } else {
            throw new Error('번역 실패');
        }
    } catch (error) {
        console.error('Translation error:', error);
        throw error;
    }
}

/**
 * 여러 문장을 순차적으로 번역
 * @param {string[]} sentences - 번역할 문장 배열
 * @param {string} targetLang - 목표 언어 코드
 * @returns {Promise<string[]>} 번역된 문장 배열
 */
export async function translateSentences(sentences, targetLang) {
    const translations = [];
    
    for (const sentence of sentences) {
        if (sentence.trim()) {
            try {
                const translated = await translateText(sentence, targetLang);
                translations.push(translated);
                // API 제한 방지
                await new Promise(resolve => setTimeout(resolve, API_CONFIG.TRANSLATION_DELAY));
            } catch (error) {
                translations.push('(번역 실패)');
            }
        } else {
            translations.push('');
        }
    }
    
    return translations;
}
