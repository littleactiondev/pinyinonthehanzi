// 중국 뉴스 기사 가져오기
import { NEWS_CONFIG } from './constants.js';

/**
 * 중국어 뉴스 가져오기 (여러 소스 시도)
 * @returns {Promise<Array>} 뉴스 기사 배열
 */
export async function fetchChineseNews() {
    // 여러 RSS 소스 순차적으로 시도
    for (const rssFeed of NEWS_CONFIG.RSS_FEEDS) {
        try {
            console.log(`Trying RSS feed: ${rssFeed}`);
            const rssUrl = encodeURIComponent(rssFeed);
            const apiUrl = `${NEWS_CONFIG.RSS_TO_JSON_API}?rss_url=${rssUrl}&api_key=${NEWS_CONFIG.API_KEY}&count=${NEWS_CONFIG.COUNT}`;
            
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (data.status === 'ok' && data.items && data.items.length > 0) {
                console.log(`Success with ${rssFeed}, got ${data.items.length} items`);
                return data.items.map(item => ({
                    title: item.title,
                    content: stripHtml(item.description || item.content || ''),
                    link: item.link,
                    pubDate: new Date(item.pubDate).toLocaleDateString('ko-KR'),
                    source: data.feed?.title || '중국 뉴스',
                }));
            }
        } catch (error) {
            console.error(`Failed with ${rssFeed}:`, error);
            continue;
        }
    }
    
    // 모든 RSS 실패 시 샘플 뉴스 반환
    console.log('All RSS feeds failed, using sample news');
    return getSampleNews();
}

/**
 * 샘플 중국어 뉴스 (학습용 - 실제 기사 스타일)
 * @returns {Array} 샘플 뉴스 배열
 */
function getSampleNews() {
    const today = new Date().toLocaleDateString('ko-KR');
    return [
        {
            title: '中国经济持续恢复向好，前三季度GDP增长5.2%',
            content: '今年以来，中国经济运行总体平稳，呈现恢复向好态势。国家统计局最新数据显示，前三季度国内生产总值同比增长5.2%，居民消费价格温和上涨。工业生产稳定增长，服务业持续恢复，消费市场逐步回暖。专家表示，中国经济展现出强大韧性和巨大潜力，全年经济社会发展主要预期目标有望较好实现。下一步将继续实施积极的财政政策和稳健的货币政策，着力扩大内需，优化结构，提振信心，防范化解风险，推动经济实现质的有效提升和量的合理增长。',
            link: 'https://example.com/news1',
            pubDate: today,
            source: '人民日报',
        },
        {
            title: '科技创新推动高质量发展，多领域取得重要突破',
            content: '中国加快建设科技强国，在人工智能、量子计算、生物技术等领域取得重要突破。创新驱动发展战略深入实施，研发投入持续增加，科技成果转化加速。今年以来，多项关键核心技术攻关取得新进展，高新技术产业增加值保持较快增长。国家重点实验室体系重组优化，科技体制改革不断深化。企业创新主体地位进一步强化，产学研深度融合发展。科技人才队伍建设取得新成效，创新创业生态持续优化。',
            link: 'https://example.com/news2',
            pubDate: today,
            source: '新华社',
        },
        {
            title: '绿色发展理念深入人心，生态文明建设成效显著',
            content: '中国坚持绿水青山就是金山银山的理念，大力推进生态文明建设。碳达峰碳中和目标稳步推进，环境质量持续改善。今年以来，全国空气质量优良天数比例稳步提升，重点流域水质明显改善。可再生能源装机规模持续扩大，清洁能源消费占比不断提高。生态保护修复工程深入实施，生物多样性保护取得积极进展。绿色低碳产业快速发展，节能环保技术广泛应用。全社会生态环保意识显著增强，绿色生活方式渐成风尚。',
            link: 'https://example.com/news3',
            pubDate: today,
            source: '光明日报',
        },
        {
            title: '教育改革促进全面发展，教育公平迈出新步伐',
            content: '中国深化教育改革，推动教育公平和质量提升。义务教育优质均衡发展取得新进展，城乡教育差距进一步缩小。职业教育适应性增强，产教融合深入推进。高等教育内涵式发展，人才培养质量不断提高。教师队伍建设持续加强，教育信息化水平显著提升。"双减"政策落地见效，学生课业负担有效减轻。教育评价改革稳步推进，素质教育理念深入人心。教育对外开放不断扩大，国际交流合作日益密切。',
            link: 'https://example.com/news4',
            pubDate: today,
            source: '中国教育报',
        },
        {
            title: '数字经济蓬勃发展，新业态新模式不断涌现',
            content: '中国数字经济规模持续扩大，5G网络建设加快推进。截至目前，5G基站数量超过300万个，用户规模突破6亿。电子商务、移动支付、共享经济等新业态新模式快速发展。数字技术与实体经济深度融合，传统产业数字化转型加速。工业互联网、智慧城市、数字政府建设取得积极进展。数据要素市场培育步伐加快，数据安全保障能力不断增强。数字经济国际合作深入开展，中国在全球数字经济治理中的作用日益凸显。',
            link: 'https://example.com/news5',
            pubDate: today,
            source: '经济日报',
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
        const fullText = item.title + '。' + item.content;
        const preview = item.content.substring(0, 100);
        
        html += `
            <div class="news-item" data-index="${index}">
                <div class="news-meta">
                    <span class="news-number">${index + 1}</span>
                    <span class="news-source">${item.source || '中国新闻'}</span>
                    <span class="news-date">${item.pubDate}</span>
                </div>
                <h3 class="news-title">${item.title}</h3>
                <p class="news-content">${preview}...</p>
                <div class="news-actions">
                    <button class="btn-use-news" data-text="${escapeHtml(fullText)}">
                        📖 이 기사로 학습하기
                    </button>
                    ${item.link !== '#' ? `<a href="${item.link}" target="_blank" class="news-link">🔗 원문 보기</a>` : ''}
                </div>
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
