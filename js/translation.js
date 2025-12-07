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
 * 여러 문장을 병렬로 번역 (배치 처리)
 * @param {string[]} sentences - 번역할 문장 배열
 * @param {string} targetLang - 목표 언어 코드
 * @returns {Promise<string[]>} 번역된 문장 배열
 */
export async function translateSentences(sentences, targetLang) {
    const batchSize = 3; // 동시에 3개씩 번역
    const translations = new Array(sentences.length);
    
    for (let i = 0; i < sentences.length; i += batchSize) {
        const batch = sentences.slice(i, i + batchSize);
        
        // 배치 내 문장들을 병렬로 번역
        const batchPromises = batch.map(async (sentence, index) => {
            if (!sentence.trim()) return '';
            
            try {
                return await translateText(sentence, targetLang);
            } catch (error) {
                console.error(`Translation failed for sentence ${i + index}:`, error);
                return '(번역 실패)';
            }
        });
        
        const batchResults = await Promise.all(batchPromises);
        
        // 결과 저장
        batchResults.forEach((result, index) => {
            translations[i + index] = result;
        });
        
        // 다음 배치 전 짧은 대기 (API 제한 방지)
        if (i + batchSize < sentences.length) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
    
    return translations;
}
