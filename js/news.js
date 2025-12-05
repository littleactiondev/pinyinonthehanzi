// 중국 뉴스 기사 가져오기
import { NEWS_CONFIG } from './constants.js';

/**
 * 샘플 중국어 뉴스 생성 (실제 API 대신 사용)
 * @returns {Promise<Array>} 뉴스 기사 배열
 */
export async function fetchChineseNews() {
    try {
        // 실제 RSS 피드 시도
        const rssUrl = encodeURIComponent(NEWS_CONFIG.RSS_FEED);
        const apiUrl = `${NEWS_CONFIG.RSS_TO_JSON_API}?rss_url=${rssUrl}&api_key=${NEWS_CONFIG.API_KEY}&count=${NEWS_CONFIG.COUNT}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.status === 'ok' && data.items && data.items.length > 0) {
            return data.items.map(item => ({
                title: item.title,
                description: stripHtml(item.description || item.content || ''),
                link: item.link,
                pubDate: item.pubDate,
            }));
        }
        
        // RSS 실패 시 샘플 뉴스 반환
        return getSampleNews();
    } catch (error) {
        console.error('News fetch error:', error);
        // 에러 시 샘플 뉴스 반환
        return getSampleNews();
    }
}

/**
 * 샘플 중국어 뉴스 (학습용)
 * @returns {Array} 샘플 뉴스 배열
 */
function getSampleNews() {
    return [
        {
            title: '中国经济持续恢复向好',
            description: '今年以来，中国经济运行总体平稳，呈现恢复向好态势。国内生产总值同比增长5.2%，居民消费价格温和上涨。',
            link: '#',
            pubDate: new Date().toISOString(),
        },
        {
            title: '科技创新推动高质量发展',
            description: '中国加快建设科技强国，在人工智能、量子计算、生物技术等领域取得重要突破。创新驱动发展战略深入实施。',
            link: '#',
            pubDate: new Date().toISOString(),
        },
        {
            title: '绿色发展理念深入人心',
            description: '中国坚持绿水青山就是金山银山的理念，大力推进生态文明建设。碳达峰碳中和目标稳步推进，环境质量持续改善。',
            link: '#',
            pubDate: new Date().toISOString(),
        },
        {
            title: '教育改革促进全面发展',
            description: '中国深化教育改革，推动教育公平和质量提升。义务教育优质均衡发展，职业教育适应性增强，高等教育内涵式发展。',
            link: '#',
            pubDate: new Date().toISOString(),
        },
        {
            title: '文化事业繁荣发展',
            description: '中国文化软实力不断提升，文化产业蓬勃发展。传统文化传承创新，现代文化创作活跃，对外文化交流深入开展。',
            link: '#',
            pubDate: new Date().toISOString(),
        },
        {
            title: '医疗卫生服务水平提高',
            description: '中国持续深化医药卫生体制改革，基本医疗保险覆盖面扩大。公共卫生服务能力增强，人民健康水平稳步提升。',
            link: '#',
            pubDate: new Date().toISOString(),
        },
        {
            title: '数字经济蓬勃发展',
            description: '中国数字经济规模持续扩大，5G网络建设加快推进。电子商务、移动支付、共享经济等新业态新模式快速发展。',
            link: '#',
            pubDate: new Date().toISOString(),
        },
        {
            title: '乡村振兴战略全面推进',
            description: '中国巩固拓展脱贫攻坚成果，全面推进乡村振兴。农业现代化水平提高，农村人居环境改善，农民收入持续增长。',
            link: '#',
            pubDate: new Date().toISOString(),
        },
        {
            title: '对外开放水平不断提升',
            description: '中国坚持高水平对外开放，积极参与全球经济治理。自由贸易试验区建设深入推进，外商投资环境持续优化。',
            link: '#',
            pubDate: new Date().toISOString(),
        },
        {
            title: '社会保障体系日益完善',
            description: '中国建立健全多层次社会保障体系，养老、医疗、失业等保险覆盖面不断扩大。社会救助制度更加健全，困难群众基本生活得到保障。',
            link: '#',
            pubDate: new Date().toISOString(),
        },
    ];
}

/**
 * HTML 태그 제거
 * @param {string} html - HTML 문자열
 * @returns {string} 순수 텍스트
 */
function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

/**
 * 뉴스 기사를 HTML로 변환
 * @param {Array} newsItems - 뉴스 기사 배열
 * @returns {string} HTML 문자열
 */
export function createNewsHTML(newsItems) {
    if (!newsItems || newsItems.length === 0) {
        return '<p class="no-news">뉴스를 불러올 수 없습니다.</p>';
    }
    
    let html = '<div class="news-list">';
    
    newsItems.forEach((item, index) => {
        const text = item.title + '。' + item.description.substring(0, 200);
        html += `
            <div class="news-item" data-index="${index}">
                <div class="news-header">
                    <span class="news-number">${index + 1}</span>
                    <h3 class="news-title">${item.title}</h3>
                </div>
                <p class="news-description">${item.description.substring(0, 150)}...</p>
                <button class="btn-use-news" data-text="${escapeHtml(text)}">
                    이 기사 사용하기
                </button>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

/**
 * HTML 이스케이프
 * @param {string} text - 텍스트
 * @returns {string} 이스케이프된 텍스트
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
