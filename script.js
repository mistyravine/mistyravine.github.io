/* =====================================================================
   script.js — DỮ LIỆU nội dung (quoteData, galleryData) + hàm dựng giao diện
   Ký hiệu ghi chú:  [MỚI] thêm mới · [SỬA] chỉnh sửa · [BỎ] đã loại bỏ
   (chi tiết đầy đủ xem CHANGELOG.md)
   Phần dữ liệu bên dưới GIỮ NGUYÊN: bạn thêm/sửa mục ở đây như trước.
   ===================================================================== */

const quoteData = [
    { text: "One day you will fly", author: "#Kalandra", bg: "https://d1lss44hh2trtw.cloudfront.net/assets/article/2022/08/10/kalandracinematic4_feature.jpg" },
    { text: "I shall never doubt the power of innocent dreamers", author: "#Queen Nehellenia", bg: "https://i.ytimg.com/vi/XKK5WUEMfbE/hqdefault.jpg" },
    { text: "Nothing. I felt nothing. No sadness or anger. No joy. No pain. No pleasure. I was free. Free to move, to go where I please. Free of desire. Free to see the universe for what it was. Empty.", author: "#Sirus", bg: "https://i.ytimg.com/vi/O0pwSQbwKPE/maxresdefault.jpg" },
    { text: "If I were you, I'd curse your incompetence!", author: "#Moriya Minakata #Last Blade", bg: "https://www.arcadequartermaster.com/lb2/win_moriya.png" },
    { text: "Nothing can erase my pain", author: "#Magician", bg: "https://i.ytimg.com/vi/PBnwj8WYNaY/hqdefault.jpg" },
];

const galleryData = {
    images: [
        { src: "images/Celeste.webp", tag: "#Celeste" },
        { src: "images/Patty.webp", tag: "#Patty #Mapple Town" },
        { src: "https://i.ytimg.com/vi/rm8Ctdm3oNM/maxresdefault.jpg", tag: "#Maria" }
    ],
    games: [
        { type: "youtube", src: "https://www.youtube.com/embed/5v025kIQBhY", tag: "#P4" },
        { type: "youtube", src: "https://www.youtube.com/embed/Z2sMGO38nAo", tag: "#Cookie Run" },
        { type: "img", src: "https://assets-prd.ignimgs.com/2024/04/08/persona-1712577088693.png", tag: "#Persona" },
        { type: "video", src: "videos/Lulingqi.mp4", tag: "#Dynasty Warriors" },
        { type: "video", src: "videos/Xushu.mp4", tag: "#Dynasty Warriors" },
        { type: "youtube", src: "https://www.youtube.com/embed/CAL4WMpBNs0", tag: "#Doki Doki" },
        { type: "youtube", src: "https://www.youtube.com/embed/2GcKrCnDBf4", tag: "#GGStrive" }
    ],
    music: [
        { type: "youtube", src: "https://www.youtube.com/embed/DSvksh6d21w", tag: "#Sacred Play" },
        { type: "video", src: "videos/I don't wanna live without your love.mp4", tag: "#I don't wanna live" },
        { type: "youtube", src: "https://www.youtube.com/embed/ZUDBd-md0VE", tag: "#Sienna" },
        { type: "youtube", src: "https://www.youtube.com/embed/tbIIf6CeXa4", tag: "#Some day this rain will stop" },
        { type: "youtube", src: "https://www.youtube.com/embed/XLwM3ZEHLJ0", tag: "#Partner" }
    ],
    videos: [
        { type: "video", src: "videos/Iloveyou.mp4", tag: "#Yuna" },
        { type: "youtube", src: "https://www.youtube.com/embed/vZO6Q0RfzS4", tag: "#Mistico" }
    ],
    personal: [
        {
            title: "I Choose Myself",
            content: `I'll think about what to write here soon`,
            footer: "Cập nhật lần cuối: 2026-06-29"
        }
    ]
};

/* ==================== HÀM DỰNG GIAO DIỆN ==================== */

// [MỚI] Escape dấu " để chèn an toàn vào thuộc tính HTML (alt, aria-label)
function attr(s) {
    return String(s).replace(/"/g, '&quot;');
}

// [MỚI] Lấy ID video từ link embed của YouTube (https://www.youtube.com/embed/<ID>)
function youtubeId(src) {
    const m = /\/embed\/([\w-]{11})(?:[?&#]|$)/.exec(src);
    return m && m[1] !== 'videoseries' ? m[1] : null; // "videoseries" = embed playlist, không phải ID video
}

function loadQuotes() {
    const container = document.getElementById('quotes');
    container.innerHTML = quoteData.map(item => `
  <div class="media-card" style="background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${item.bg}) no-repeat center/cover">
    <p class="quote-style">${item.text}</p>
    <div class="media-footer">${item.author}</div>
  </div>
`).join('');
}

// [MỚI] Dựng nội dung của MỘT tab, chỉ ở lần đầu tab được mở.
// Trước đây renderAllSections() dựng tất cả tab ngay khi vào trang -> 9 iframe YouTube + 4 video tải cùng lúc dù đang ẩn.
function renderSection(sectionId) {
    const container = document.getElementById(sectionId);
    if (!container || container.dataset.rendered === '1') return;
    container.dataset.rendered = '1';

    if (sectionId === 'quotes') { loadQuotes(); return; }

    const items = galleryData[sectionId];
    if (!items) return;

    container.innerHTML = items.map((item, index) => {
        // Xử lý riêng cho tab 'personal'
        if (sectionId === 'personal') {
            return `
                <article class="personal-article">
                    <h2 class="article-heading">${item.title || "About Me"}</h2>
                    <div class="article-content">${item.content || ""}</div>
                    <footer class="article-footer">${item.footer || ""}</footer>
                </article>`;
        }

        // Logic cho các tab media (images, games, music, videos)
        let content = '';
        if (item.type === 'youtube') {
            const id = youtubeId(item.src);
            if (id) {
                // [SỬA] Ảnh bìa + nút Play; player thật chỉ nạp khi bấm (xem activateYouTube trong base.js)
                content = `<button type="button" class="yt-facade" data-src="${attr(item.src)}" aria-label="Play video ${attr(item.tag)}">
                    <img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy" decoding="async">
                    <span class="yt-play" aria-hidden="true"></span>
                </button>`;
            } else {
                // Link không đúng dạng embed/<ID> (vd. playlist): giữ iframe như cũ nhưng nạp lười
                content = `<iframe class="js-video" src="${item.src}" frameborder="0" allowfullscreen loading="lazy"></iframe>`;
            }
        } else if (item.type === 'video') {
            // [SỬA] preload="metadata" + playsinline; #t=0.001 để hiện khung hình đầu (kể cả iOS)
            content = `<video class="js-video" controls playsinline preload="metadata"><source src="${item.src}#t=0.001" type="video/mp4"></video>`;
        } else {
            // [SỬA] Ảnh đầu tiên tải ưu tiên, các ảnh sau nạp lười
            const loading = index === 0 ? 'fetchpriority="high"' : 'loading="lazy"';
            content = `<img src="${item.src}" alt="${attr(item.tag)}" ${loading} decoding="async">`;
        }

        return `
            <div class="media-card">
              <div class="media-content">${content}</div>
              <div class="media-footer">${item.tag}</div>
            </div>`;
    }).join('');
}

// [GIỮ LẠI] Dựng tất cả tab một lượt (tương thích với code cũ nếu bạn có gọi nơi khác). Trang không còn tự gọi hàm này.
function renderAllSections() {
    renderSection('quotes');
    Object.keys(galleryData).forEach(renderSection);
}

document.addEventListener('DOMContentLoaded', () => {
    renderSection('images'); // [SỬA] chỉ dựng tab đang hiển thị; các tab còn lại dựng khi mở (openTab trong base.js)
});
