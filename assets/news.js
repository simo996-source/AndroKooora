/* ============================================================
   أندرو كورة — منطق عرض الأخبار (news.html + news-article.html)
   يعتمد على مصفوفة window.ARTICLES المعرّفة في assets/articles.js
   ============================================================ */

const NEWS_PAGE_SIZE = 12;
let newsVisibleCount = NEWS_PAGE_SIZE;
let newsActiveCategory = "";

function sortedArticles() {
    return (window.ARTICLES || [])
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function newsArticleUrl(a) {
    return `news-article.html?slug=${encodeURIComponent(a.slug)}`;
}

function formatNewsDate(iso) {
    try {
        return new Date(iso).toLocaleDateString("ar", { year: "numeric", month: "long", day: "numeric" });
    } catch (e) {
        return "";
    }
}

function newsFallbackImage() {
    return "https://via.placeholder.com/600x360/0f1613/f2b632?text=AndroKooora";
}

// ---------- Listing card (reuses the same .post-card look as app posts) ----------
function renderNewsCard(a) {
    return `
        <a href="${newsArticleUrl(a)}" class="post-card">
            <img src="${a.image || newsFallbackImage()}" class="post-image" alt="${a.title}">
            <div class="ticket-divider"></div>
            <div class="post-content">
                <span class="post-tag">${a.category || ""}</span>
                <h3 class="post-title">${a.title}</h3>
                <p class="post-excerpt">${a.excerpt || ""}</p>
                <div class="post-meta">
                    <span>${formatNewsDate(a.date)}</span>
                </div>
            </div>
        </a>
    `;
}

function renderNewsGrid() {
    const grid = document.getElementById("news-grid");
    const empty = document.getElementById("news-empty-state");
    const loadMoreBtn = document.getElementById("load-more-btn");
    if (!grid) return;

    const q = (document.getElementById("news-search-input")?.value || "").trim().toLowerCase();

    let list = sortedArticles();
    if (newsActiveCategory) list = list.filter(a => a.category === newsActiveCategory);
    if (q) {
        list = list.filter(a =>
            (a.title || "").toLowerCase().includes(q) ||
            (a.excerpt || "").toLowerCase().includes(q) ||
            (a.category || "").toLowerCase().includes(q));
    }

    if (list.length === 0) {
        grid.innerHTML = "";
        if (empty) empty.style.display = "block";
        if (loadMoreBtn) loadMoreBtn.style.display = "none";
        return;
    }
    if (empty) empty.style.display = "none";

    const visible = list.slice(0, newsVisibleCount);
    grid.innerHTML = visible.map(renderNewsCard).join("");

    if (loadMoreBtn) {
        loadMoreBtn.style.display = visible.length < list.length ? "inline-block" : "none";
    }
}

function renderNewsCategories() {
    const el = document.getElementById("news-categories-list");
    if (!el) return;

    const cats = [...new Set(sortedArticles().map(a => a.category).filter(Boolean))].slice(0, 14);
    el.innerHTML = cats.map(cat => `<button type="button" class="chip" data-cat="${cat}">${cat}</button>`).join("");

    el.querySelectorAll(".chip").forEach(chip => {
        chip.addEventListener("click", () => {
            const isActive = chip.classList.contains("active");
            el.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
            newsActiveCategory = isActive ? "" : chip.dataset.cat;
            if (!isActive) chip.classList.add("active");
            newsVisibleCount = NEWS_PAGE_SIZE;
            renderNewsGrid();
        });
    });
}

function renderMiniNewsItem(a) {
    return `
        <li class="mini-item">
            <a href="${newsArticleUrl(a)}" style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;">
                <img src="${a.image || newsFallbackImage()}" class="mini-thumb" alt="${a.title}">
                <div class="mini-info">
                    <p class="mini-title">${a.title}</p>
                    <span class="mini-meta">${formatNewsDate(a.date)}</span>
                </div>
            </a>
        </li>
    `;
}

function renderNewsSidebarLatest(excludeSlug) {
    const el = document.getElementById("news-latest-list");
    if (!el) return;
    const latest = sortedArticles().filter(a => a.slug !== excludeSlug).slice(0, 6);
    el.innerHTML = latest.map(renderMiniNewsItem).join("");
}

// ---------- Detail page ----------
function renderNewsArticle() {
    const root = document.getElementById("news-article-root");
    if (!root) return;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");
    const article = (window.ARTICLES || []).find(a => a.slug === slug);

    if (!article) {
        root.innerHTML = `<div class="empty-state">لم يتم العثور على هذا الخبر.<br><a href="news.html">العودة إلى الأخبار</a></div>`;
        return;
    }

    document.title = `${article.title} | أندرو كورة`;
    const metaDesc = document.getElementById("meta-description");
    if (metaDesc) metaDesc.setAttribute("content", article.excerpt || article.title);

    const crumb = document.getElementById("crumb-title");
    if (crumb) crumb.textContent = article.title;

    const shareUrl = encodeURIComponent(location.origin + location.pathname.replace(/[^/]*$/, "") + newsArticleUrl(article));
    const shareText = encodeURIComponent(article.title);

    root.innerHTML = `
        <div class="article-header">
            <h1>${article.title}</h1>
            <div class="article-meta">
                <span>✍️ ${article.author || "أندرو كورة"}</span>
                <span>📅 ${formatNewsDate(article.date)}</span>
                <span>🏷️ ${article.category || ""}</span>
            </div>
        </div>
        ${article.image ? `<img src="${article.image}" class="news-article-cover" alt="${article.title}">` : ""}
        <div class="article-body">
            ${(article.body || []).map(p => `<p>${p}</p>`).join("")}
        </div>
        <div class="article-share">
            <span class="share-label">شارك الخبر:</span>
            <a class="share-btn" target="_blank" rel="noopener" href="https://t.me/share/url?url=${shareUrl}&text=${shareText}">تيليجرام</a>
            <a class="share-btn" target="_blank" rel="noopener" href="https://wa.me/?text=${shareText}%20${shareUrl}">واتساب</a>
            <a class="share-btn" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}">X</a>
            <a class="share-btn" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}">فيسبوك</a>
        </div>
    `;

    renderNewsSidebarLatest(article.slug);
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("news-grid")) {
        renderNewsCategories();
        renderNewsGrid();
        renderNewsSidebarLatest();

        const searchInput = document.getElementById("news-search-input");
        if (searchInput) {
            searchInput.addEventListener("input", () => {
                newsVisibleCount = NEWS_PAGE_SIZE;
                renderNewsGrid();
            });
        }

        const loadMoreBtn = document.getElementById("load-more-btn");
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener("click", () => {
                newsVisibleCount += NEWS_PAGE_SIZE;
                renderNewsGrid();
            });
        }
    }

    if (document.getElementById("news-article-root")) {
        renderNewsArticle();

        const searchInput = document.getElementById("news-search-input");
        if (searchInput) {
            searchInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter" && searchInput.value.trim()) {
                    window.location.href = `news.html?q=${encodeURIComponent(searchInput.value.trim())}`;
                }
            });
        }
    }
});
