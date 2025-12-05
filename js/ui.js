// UI 헬퍼 함수

/**
 * 로딩 표시
 * @param {HTMLElement} element - 로딩을 표시할 요소
 */
export function showLoading(element) {
    if (element) {
        element.style.display = 'block';
    }
}

/**
 * 로딩 숨김
 * @param {HTMLElement} element - 로딩 요소
 */
export function hideLoading(element) {
    if (element) {
        element.style.display = 'none';
    }
}

/**
 * 섹션 표시
 * @param {HTMLElement} element - 표시할 섹션
 */
export function showSection(element) {
    if (element) {
        element.style.display = 'block';
    }
}

/**
 * 섹션 숨김
 * @param {HTMLElement} element - 숨길 섹션
 */
export function hideSection(element) {
    if (element) {
        element.style.display = 'none';
    }
}

/**
 * 에러 메시지 표시
 * @param {HTMLElement} errorDiv - 에러 메시지를 표시할 요소
 * @param {string} message - 에러 메시지
 */
export function showError(errorDiv, message) {
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

/**
 * 에러 메시지 숨김
 * @param {HTMLElement} errorDiv - 에러 메시지 요소
 */
export function hideError(errorDiv) {
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

/**
 * 로딩 오버레이 생성
 * @returns {HTMLElement} 로딩 오버레이 요소
 */
export function createLoadingOverlay() {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = '<div class="spinner"></div><p>번역 중...</p>';
    return loadingOverlay;
}
