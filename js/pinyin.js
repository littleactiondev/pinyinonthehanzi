// 병음 변환 관련 기능

// 숫자 병음 매핑
const NUMBER_PINYIN = {
    '0': 'líng', '1': 'yī', '2': 'èr', '3': 'sān', '4': 'sì',
    '5': 'wǔ', '6': 'liù', '7': 'qī', '8': 'bā', '9': 'jiǔ',
};

/**
 * 중국어 텍스트를 문장 단위로 분리
 * @param {string} text - 중국어 텍스트
 * @returns {string[]} 문장 배열
 */
export function splitIntoSentences(text) {
    // 숫자 뒤의 점(소수점, 퍼센트 등)을 임시로 치환
    const protectedText = text.replace(/(\d)\.(\d)/g, '$1〔DOT〕$2');
    
    // 문장 분리
    const sentences = protectedText.match(/[^。！？.!?]+[。！？.!?]*/g) || [protectedText];
    
    // 임시 치환한 점 복원
    return sentences.map(s => s.replace(/〔DOT〕/g, '.'));
}

/**
 * 문자의 병음 가져오기 (한자 또는 숫자)
 * @param {string} char - 문자
 * @returns {string} 병음
 */
function getPinyin(char) {
    // 숫자인 경우
    if (/[0-9]/.test(char)) {
        return NUMBER_PINYIN[char] || char;
    }
    
    // 한자인 경우
    if (/[\u4e00-\u9fa5]/.test(char)) {
        return window.pinyinPro 
            ? window.pinyinPro.pinyin(char, { toneType: 'symbol' }) 
            : char;
    }
    
    return null;
}

/**
 * 병음 없이 중국어만 표시 (한 줄씩)
 * @param {string} chineseText - 중국어 텍스트
 * @returns {string} HTML 문자열
 */
export function createPlainChineseHTML(chineseText) {
    const sentences = splitIntoSentences(chineseText);
    let html = '';
    
    sentences.forEach((sentence) => {
        if (!sentence.trim()) return;
        html += `<div class="sentence-line">${sentence}</div>`;
    });
    
    return html;
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
        
        // 병음 + 한자/숫자
        for (const char of sentence) {
            const pinyin = getPinyin(char);
            if (pinyin) {
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
        
        // 한자/숫자만 (병음 공간 유지)
        for (const char of sentence) {
            const pinyin = getPinyin(char);
            if (pinyin) {
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
