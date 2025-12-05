// 병음 변환 관련 기능

/**
 * 중국어 텍스트를 문장 단위로 분리
 * @param {string} text - 중국어 텍스트
 * @returns {string[]} 문장 배열
 */
export function splitIntoSentences(text) {
    return text.match(/[^。！？.!?]+[。！？.!?]*/g) || [text];
}

/**
 * 중국어 텍스트를 병음과 함께 HTML로 변환 (문장별 번역 포함)
 * @param {string} chineseText - 중국어 텍스트
 * @param {string[]|null} translations - 번역 배열 (선택)
 * @returns {string} HTML 문자열
 */
export function createPinyinHTML(chineseText, translations = null) {
    const sentences = splitIntoSentences(chineseText);
    let html = '';
    
    sentences.forEach((sentence, index) => {
        if (!sentence.trim()) return;
        
        html += '<div class="sentence-block">';
        
        // 병음 + 한자
        for (const char of sentence) {
            if (/[\u4e00-\u9fa5]/.test(char)) {
                const pinyin = window.pinyinPro 
                    ? window.pinyinPro.pinyin(char, { toneType: 'symbol' }) 
                    : char;
                html += `<ruby>${char}<rt>${pinyin}</rt></ruby>`;
            } else {
                html += char;
            }
        }
        
        // 번역
        if (translations && translations[index]) {
            html += `<div class="sentence-translation">${translations[index]}</div>`;
        }
        
        html += '</div>';
    });
    
    return html;
}

/**
 * 중국어 텍스트를 병음 없이 같은 스타일로 변환 (문장별 번역 포함)
 * @param {string} chineseText - 중국어 텍스트
 * @param {string[]|null} translations - 번역 배열 (선택)
 * @returns {string} HTML 문자열
 */
export function createChineseOnlyHTML(chineseText, translations = null) {
    const sentences = splitIntoSentences(chineseText);
    let html = '';
    
    sentences.forEach((sentence, index) => {
        if (!sentence.trim()) return;
        
        html += '<div class="sentence-block">';
        
        // 한자만 (병음 공간 유지)
        for (const char of sentence) {
            if (/[\u4e00-\u9fa5]/.test(char)) {
                html += `<ruby>${char}<rt style="visibility: hidden;">.</rt></ruby>`;
            } else {
                html += char;
            }
        }
        
        // 번역
        if (translations && translations[index]) {
            html += `<div class="sentence-translation">${translations[index]}</div>`;
        }
        
        html += '</div>';
    });
    
    return html;
}
