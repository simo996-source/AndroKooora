// ============================================================
// أندرو كورة — منطق العرض والبحث
// ============================================================

function filterByPlatform(list, platform) {
    return platform ? list.filter(p => p.platform === platform) : list;
}

function getFeaturedPost(platform) {
    const scoped = filterByPlatform(POSTS, platform);
    return scoped.find(p => p.featured) || scoped[0] || null;
}

function getTrendingList(excludeId, platform) {
    const scoped = filterByPlatform(POSTS, platform);
    let list = scoped.filter(p => p.trending && p.id !== excludeId);
    if (list.length === 0) list = scoped.filter(p => p.id !== excludeId).slice(0, 4);
    return list.slice(0, 4);
}

function getLatestList(excludeId, platform) {
    const scoped = filterByPlatform(POSTS, platform);
    return scoped.filter(p => p.id !== excludeId).slice(0, 5);
}

function getCategories(platform) {
    const scoped = filterByPlatform(POSTS, platform);
    return [...new Set(scoped.map(p => p.tag))];
}

// ---------- Platform tabs (تطبيقات أندرويد / تطبيقات TV) ----------
function getActivePlatform() {
    return new URLSearchParams(window.location.search).get("platform") || "";
}

function setupPlatformNav() {
    const platform = getActivePlatform();

    const homeLink = document.getElementById("nav-home");
    const androidLink = document.getElementById("nav-android");
    const tvLink = document.getElementById("nav-tv");
    const links = [homeLink, androidLink, tvLink];

    if (!platform) return ""; // اترك التمييز الافتراضي الموجود في HTML كما هو (الرئيسية / أحدث الأخبار)

    links.forEach(el => el && el.classList.remove("active"));
    if (platform === "android" && androidLink) androidLink.classList.add("active");
    if (platform === "tv" && tvLink) tvLink.classList.add("active");

    const titleEl = document.getElementById("apps-section-title");
    if (titleEl) {
        if (platform === "android") titleEl.textContent = "تطبيقات أندرويد";
        else if (platform === "tv") titleEl.textContent = "تطبيقات TV";
    }

    return platform;
}

// ---------- Hero ----------
function renderHero(platform) {
    const root = document.getElementById("hero-root");
    if (!root) return;

    const post = getFeaturedPost(platform);
    if (!post) {
        root.innerHTML = `<div class="empty-state">لا توجد تطبيقات في هذا القسم حالياً. تابعونا قريباً!</div>`;
        return;
    }

    root.innerHTML = `
        <a href="article.html?id=${post.id}" class="hero-post">
            <img src="${post.image}" class="hero-image" alt="${post.title}">
            <div class="hero-content">
                <span class="hero-tag">${post.tag}</span>
                <h2 class="hero-title">${post.title}</h2>
                <p class="hero-excerpt">${post.excerpt}</p>
                <span class="hero-cta">اقرأ المزيد وحمّل التطبيق</span>
            </div>
        </a>
    `;
}

// ---------- Post grid ----------
function renderCard(post) {
    return `
        <a href="article.html?id=${post.id}" class="post-card">
            <img src="${post.image}" class="post-image" alt="${post.title}">
            <div class="ticket-divider"></div>
            <div class="post-content">
                <span class="post-tag">${post.tag}</span>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${post.excerpt}</p>
                <div class="post-meta">
                    <span>${post.date}</span>
                    <span>${post.version}</span>
                </div>
            </div>
        </a>
    `;
}

function renderGrid(list) {
    const grid = document.getElementById("posts-grid");
    const empty = document.getElementById("empty-state");
    if (!grid) return;

    if (list.length === 0) {
        grid.innerHTML = "";
        if (empty) empty.style.display = "block";
        return;
    }
    if (empty) empty.style.display = "none";
    grid.innerHTML = list.map(renderCard).join("");
}

// ---------- Sidebar widgets ----------
function renderMiniItem(post, rank) {
    return `
        <li class="mini-item">
            <a href="article.html?id=${post.id}" style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;">
                ${rank ? `<span class="mini-rank">${rank}</span>` : ""}
                <img src="${post.image}" class="mini-thumb" alt="${post.title}">
                <div class="mini-info">
                    <p class="mini-title">${post.title}</p>
                    <span class="mini-meta">${post.date}</span>
                </div>
            </a>
        </li>
    `;
}

function renderSidebar(excludeId, platform) {
    const trendingEl = document.getElementById("trending-list");
    if (trendingEl) {
        const trending = getTrendingList(excludeId, platform);
        trendingEl.innerHTML = trending.map((p, i) => renderMiniItem(p, i + 1)).join("");
    }

    const latestEl = document.getElementById("latest-list");
    if (latestEl) {
        const latest = getLatestList(excludeId, platform);
        latestEl.innerHTML = latest.map(p => renderMiniItem(p, null)).join("");
    }

    const catsEl = document.getElementById("categories-list");
    if (catsEl) {
        const cats = getCategories(platform);
        catsEl.innerHTML = cats.map(cat => `<button type="button" class="chip" data-cat="${cat}">${cat}</button>`).join("");
        catsEl.querySelectorAll(".chip").forEach(chip => {
            chip.addEventListener("click", () => {
                const input = document.getElementById("search-input");
                if (input) {
                    input.value = chip.dataset.cat;
                    input.dispatchEvent(new Event("input"));
                    catsEl.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
                    chip.classList.add("active");
                }
            });
        });
    }
}

// ---------- Search ----------
function setupSearch() {
    const input = document.getElementById("search-input");
    if (!input) return;

    if (!document.getElementById("posts-grid")) {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && input.value.trim()) {
                window.location.href = `index.html?q=${encodeURIComponent(input.value.trim())}`;
            }
        });
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";
    if (initialQuery) input.value = initialQuery;

    function applyFilter() {
        const q = input.value.trim().toLowerCase();
        const platform = getActivePlatform();

        let filtered = POSTS;
        if (platform) filtered = filtered.filter(p => p.platform === platform);
        if (q) {
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(q) ||
                p.tag.toLowerCase().includes(q) ||
                p.excerpt.toLowerCase().includes(q));
        }
        renderGrid(filtered);
    }

    input.addEventListener("input", applyFilter);
    applyFilter();
}

// ---------- Homepage "أحدث الأخبار" preview section ----------
function sortedArticlesForHome() {
    return (window.ARTICLES || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
}

function homeNewsUrl(a) {
    return `news-article.html?slug=${encodeURIComponent(a.slug)}`;
}

function formatHomeNewsDate(iso) {
    try {
        return new Date(iso).toLocaleDateString("ar", { year: "numeric", month: "long", day: "numeric" });
    } catch (e) {
        return "";
    }
}

function homeNewsFallbackImage() {
    return "https://via.placeholder.com/600x360/0f1613/f2b632?text=AndroKooora";
}

function renderHomeNewsCard(a) {
    return `
        <a href="${homeNewsUrl(a)}" class="post-card">
            <img src="${a.image || homeNewsFallbackImage()}" class="post-image" alt="${a.title}">
            <div class="ticket-divider"></div>
            <div class="post-content">
                <span class="post-tag">${a.category || ""}</span>
                <h3 class="post-title">${a.title}</h3>
                <p class="post-excerpt">${a.excerpt || ""}</p>
                <div class="post-meta">
                    <span>${formatHomeNewsDate(a.date)}</span>
                </div>
            </div>
        </a>
    `;
}

function renderHomeNews() {
    const grid = document.getElementById("home-news-grid");
    if (!grid) return;
    const latest = sortedArticlesForHome().slice(0, 3);
    grid.innerHTML = latest.map(renderHomeNewsCard).join("");
}

// ---------- Article page ----------
function renderArticleBody(blocks) {
    return blocks.map(block => {
        if (block.type === "p") return `<p>${block.text}</p>`;
        if (block.type === "h3") return `<h3>${block.text}</h3>`;
        if (block.type === "ul") return `<ul>${block.items.map(i => `<li>${i}</li>`).join("")}</ul>`;
        return "";
    }).join("");
}

function renderArticle() {
    const root = document.getElementById("article-root");
    if (!root) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const post = POSTS.find(p => p.id === id);

    if (!post) {
        root.innerHTML = `<div class="empty-state">لم يتم العثور على هذا المقال.</div>`;
        return;
    }

    document.title = `${post.title} | أندرو كورة`;
    const crumb = document.getElementById("crumb-title");
    if (crumb) crumb.textContent = post.title;

    root.innerHTML = `
        <div class="article-header">
            <h1>${post.title}</h1>
            <div class="article-meta">
                <span>📅 ${post.date}</span>
                <span>🏷️ ${post.tag}</span>
            </div>
        </div>
        <img src="${post.image}" class="article-cover" alt="${post.title}">
        <div class="article-body">
            ${renderArticleBody(post.body)}
            <table class="specs-table">
                <tr><td>الإصدار</td><td>${post.version}</td></tr>
                <tr><td>حجم التطبيق</td><td>${post.size}</td></tr>
                <tr><td>يتطلب أندرويد</td><td>${post.android}</td></tr>
            </table>
        </div>

        <div class="download-section">
            <h3>رابط تحميل التطبيق (APK)</h3>
            <p class="download-note">الإصدار ${post.version} — ${post.size}</p>
            <a href="${post.downloadLink}" target="_blank" rel="noopener" class="download-btn">
                ⬇️ تحميل التطبيق الآن
            </a>
            
        </div>
    `;

    renderSidebar(post.id);
}

document.addEventListener("DOMContentLoaded", () => {
    const platform = setupPlatformNav();
    renderHero(platform);
    renderGrid(typeof POSTS !== "undefined" ? POSTS : []);
    renderArticle();
    setupSearch();
    renderHomeNews();

    // السايدبار في الصفحة الرئيسية (صفحة المقال تستدعيها بنفسها بعد معرفة المقال المستثنى)
    if (document.getElementById("posts-grid")) {
        const featured = getFeaturedPost(platform);
        renderSidebar(featured ? featured.id : null, platform);
    }
});
