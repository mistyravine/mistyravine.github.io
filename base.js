/* =====================================================================
   base.js — hành vi chung: tab, nhạc, mưa, loader, video, chatbot
   Ký hiệu ghi chú:  [MỚI] thêm mới · [SỬA] chỉnh sửa · [BỎ] đã loại bỏ
   (chi tiết đầy đủ xem CHANGELOG.md)
   Tên hàm toàn cục được giữ nguyên: openTab, playMusic, pauseAllMedia
   ===================================================================== */

/* [MỚI] Phát hiện người dùng muốn giảm chuyển động / bật tiết kiệm dữ liệu */
const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveData = !!(navigator.connection && navigator.connection.saveData);

/* ==================== CHẾ ĐỘ HIỆU ỨNG (FX): Light / Full ====================
   [MỚI] Video nền (trộn màu screen) + kính mờ phía sau + 150 giọt mưa + chữ động chạy LIÊN TỤC mỗi khung hình
   nên GPU/CPU luôn bận → quạt quay. Đo thực tế: Light nhẹ hơn Full khoảng 2 lần.
   - 'light': không video nền, mưa tối đa 60 giọt, chữ động chạy ~12 khung/giây.   (mặc định)
   - 'full' : đúng giao diện đầy đủ như bản gốc (video nền + mưa 150 giọt trên PC).
   Nút "✨ FX" (góc trái dưới) đổi qua lại và được nhớ lại cho lần sau.
   Muốn mặc định là Full: đổi FX_DEFAULT thành 'full'. */
const FX_DEFAULT = 'light';
const FX_KEY = 'hiraeth-fx';
function readFx() {
  try { var v = localStorage.getItem(FX_KEY); if (v === 'light' || v === 'full') return v; } catch (e) { }
  return saveData ? 'light' : FX_DEFAULT;
}
let fxMode = readFx();
document.documentElement.setAttribute('data-fx', fxMode);

function syncFxBtn() {
  var btn = document.getElementById('fxBtn');
  var label = document.getElementById('fxLabel');
  if (!btn || !label) return;
  label.textContent = fxMode === 'full' ? 'Full' : 'Light';
  btn.setAttribute('aria-pressed', String(fxMode === 'full'));
  btn.title = fxMode === 'full'
    ? 'Hiệu ứng: Full (đầy đủ, tốn máy hơn). Bấm để chuyển sang Light.'
    : 'Hiệu ứng: Light (nhẹ máy, bớt ồn quạt). Bấm để bật Full: video nền + mưa dày.';
}
function setFx(mode) {
  fxMode = mode;
  try { localStorage.setItem(FX_KEY, mode); } catch (e) { }
  document.documentElement.setAttribute('data-fx', mode);
  syncFxBtn();
  buildRain();
  if (mode === 'full') startOverlayVideo(); else stopOverlayVideo();
}
document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('fxBtn');
  if (!btn) return;
  btn.addEventListener('click', function () { setFx(fxMode === 'full' ? 'light' : 'full'); });
  syncFxBtn();
});

/* ==================== TAB ==================== */
function openTab(evt, categoryName) {
  pauseAllMedia();

  var target = document.getElementById(categoryName);
  if (!target) return;

  // [MỚI] Dựng nội dung tab ở lần mở đầu tiên (hàm renderSection nằm trong script.js)
  if (typeof renderSection === 'function') renderSection(categoryName);

  // 1. Ẩn tất cả các tab-content
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tab-content");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // 2. Xóa class "active" ở tất cả các nút
  tablinks = document.getElementsByClassName("nav-btn");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove("active");
    tablinks[i].setAttribute("aria-selected", "false");
  }

  // 3. Hiện tab được chọn và thêm class "active" cho nút đó
  target.style.display = "block";
  var btn = (evt && evt.currentTarget) || document.querySelector('.nav-btn[data-tab="' + categoryName + '"]');
  if (btn) {
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
  }

  document.querySelector('.media-wrapper').scrollTop = 0;
}

/* ==================== NHẠC NỀN ==================== */
function playMusic() {
  // Lấy element ngay tại thời điểm nhấn nút
  var audio = document.getElementById("localAudio");
  if (!audio) return; // [SỬA] kiểm tra null TRƯỚC khi dùng audio (bản cũ đặt audio.volume trước dòng này)

  audio.volume = 0.6;

  if (audio.paused) {
    var p = audio.play();
    if (p && p.catch) p.catch(syncMusicBtn); // [MỚI] không để lỗi autoplay/mạng thành lỗi chưa xử lý
  } else {
    audio.pause();
  }
  // Nút Play/Pause được cập nhật bởi sự kiện play/pause bên dưới
}

// [MỚI] Nút luôn khớp trạng thái thật của audio (kể cả khi hết bài hoặc hệ điều hành tạm dừng nhạc)
function syncMusicBtn() {
  var audio = document.getElementById("localAudio");
  var btnIcon = document.getElementById("btnIcon");
  var btnText = document.getElementById("btnText");
  if (!audio || !btnIcon || !btnText) return;
  btnIcon.textContent = audio.paused ? "▶" : "⏸";
  btnText.textContent = audio.paused ? "Play" : "Pause";
}
document.addEventListener('DOMContentLoaded', function () {
  var audio = document.getElementById("localAudio");
  if (!audio) return;
  audio.addEventListener('play', syncMusicBtn);
  audio.addEventListener('pause', syncMusicBtn);
  audio.addEventListener('ended', syncMusicBtn);
});

/* ==================== MƯA ==================== */
// [SỬA] Tách thành hàm buildRain() để dựng lại khi đổi chế độ FX.
function buildRain() {
  const container = document.getElementById('rainContainer');
  if (!container) return;
  container.textContent = ''; // xóa mưa cũ (khi đổi chế độ)
  if (prefersReducedMotion) return; // [MỚI] tôn trọng "giảm chuyển động"

  // Change this number for more/less rain.
  const MAX_DROPS = 150;
  const LIGHT_MAX_DROPS = 60; // [MỚI] mức tối đa ở chế độ Light
  // [SỬA] Số giọt mưa theo bề ngang màn hình: PC (>= ~1275px) ở Full vẫn đủ 150 như cũ,
  // điện thoại ít hơn (khoảng 45); bật tiết kiệm dữ liệu thì còn 40.
  let dropCount = saveData ? 40 : Math.max(45, Math.min(MAX_DROPS, Math.round(window.innerWidth / 8.5)));
  if (fxMode === 'light') dropCount = Math.min(dropCount, LIGHT_MAX_DROPS);

  const SVG_NS = "http://www.w3.org/2000/svg";
  // [SỬA] Tạo 1 giọt mẫu rồi nhân bản (cloneNode) + chèn 1 lần bằng DocumentFragment,
  // thay vì parse innerHTML 150 lần và chèn 150 lần vào DOM.
  const proto = document.createElementNS(SVG_NS, "svg");
  proto.setAttribute("class", "rain__drop");
  proto.setAttribute("viewBox", "0 0 5 50");
  proto.setAttribute("preserveAspectRatio", "xMinYMin");
  proto.innerHTML = `<path stroke="none" d="M 2.5,0 C 2.6949458,3.5392017 3.344765,20.524571 4.4494577,30.9559 5.7551357,42.666753 4.5915685,50 2.5,50 0.40843152,50 -0.75513565,42.666753 0.55054234,30.9559 1.655235,20.524571 2.3050542,3.5392017 2.5,0 Z"></path>`;

  const frag = document.createDocumentFragment();
  for (let i = 0; i < dropCount; i++) {
    const drop = proto.cloneNode(true);

    const x = Math.floor(Math.random() * 100);
    const o = Math.random() * 0.8 + 0.2; // Opacity
    const a = Math.random() * 0.5 + 0.5; // Speed
    const d = 0;
    const s = Math.random() * 0.6 + 0.4; // Scale
    const delay = Math.random() * -20;

    // Setting the CSS variables
    drop.style.setProperty('--x', x);
    drop.style.setProperty('--o', o);
    drop.style.setProperty('--a', a);
    drop.style.setProperty('--d', d);
    drop.style.setProperty('--s', s);
    drop.style.setProperty('--delay', delay + 's');

    frag.appendChild(drop);
  }
  container.appendChild(frag);
}
document.addEventListener('DOMContentLoaded', buildRain);

/* ==================== LOADER ==================== */
window.addEventListener('DOMContentLoaded', () => {
  const images = [
    'images/loader/Shaper.jpg',
    'images/loader/Frill.jpg'
  ];

  const randomImage = images[Math.floor(Math.random() * images.length)];
  const loaderImg = document.getElementById('loader-bg');

  if (loaderImg) {
    loaderImg.src = randomImage;
  }
});

// Code ẩn loader sau khi trang tải xong
// [SỬA] Ẩn bằng class .loader-hidden rồi GỠ HẲN loader khỏi DOM sau khi mờ xong (giải phóng ảnh toàn màn hình + animation).
// [MỚI] Có "chốt chặn" 7 giây: nếu 1 tài nguyên ngoài bị treo thì loader vẫn tự tắt (bản cũ sẽ kẹt mãi).
let loaderHidden = false;
function hideLoader() {
  if (loaderHidden) return;
  loaderHidden = true;
  const loader = document.getElementById('loader');
  if (!loader) return;
  loader.classList.add('loader-hidden');
  setTimeout(() => loader.remove(), 900); // transition của loader là 0.8s
}
window.addEventListener('load', () => {
  setTimeout(hideLoader, 1500); // Đợi 1.5s cho đẹp
  startOverlayVideo();
  loadChatbotLater();
});
setTimeout(hideLoader, 7000);

/* ==================== VIDEO OVERLAY (nền động) ==================== */
// [SỬA] Video overlay chỉ bắt đầu tải/chạy SAU khi trang đã load xong (trước đây tranh băng thông và làm loader chờ lâu).
// [MỚI] Chỉ chạy ở chế độ FX = Full. Ở Light thì KHÔNG tải và KHÔNG giải mã video này (đây là hiệu ứng tốn máy nhất).
let overlayHooked = false;
function startOverlayVideo() {
  const v = document.querySelector('.video-overlay');
  if (!v || !v.dataset.src || prefersReducedMotion || fxMode !== 'full') return;

  const tryPlay = () => { const p = v.play(); if (p && p.catch) p.catch(() => { }); };

  if (!v.getAttribute('src')) {
    v.src = v.dataset.src;
    v.addEventListener('playing', () => v.classList.add('is-playing'), { once: true });
  }
  const p = v.play();
  if (p && p.catch) {
    // Trình duyệt chặn autoplay (vd. iOS chế độ tiết kiệm pin): thử lại ở lần chạm đầu tiên
    p.catch(() => window.addEventListener('pointerdown', tryPlay, { once: true }));
  }

  // [MỚI] Tạm dừng khi chuyển sang tab khác để đỡ tốn pin/CPU
  if (!overlayHooked) {
    overlayHooked = true;
    document.addEventListener('visibilitychange', () => {
      if (!v.getAttribute('src')) return;
      if (document.hidden) v.pause(); else if (fxMode === 'full') tryPlay();
    });
  }
}

// [MỚI] Dừng hẳn video nền: ngừng tải + ngừng giải mã khi chuyển sang Light
function stopOverlayVideo() {
  const v = document.querySelector('.video-overlay');
  if (!v) return;
  v.pause();
  v.classList.remove('is-playing');
  if (v.getAttribute('src')) {
    v.removeAttribute('src');
    v.load();
  }
}

/* ==================== YOUTUBE + VIDEO ==================== */
// Hàm dừng tất cả video và iframe
function pauseAllMedia() {
  // 1. Dừng tất cả video MP4 cục bộ
  const allVideos = document.querySelectorAll('video.js-video');
  allVideos.forEach(video => video.pause());

  // 2. Dừng tất cả YouTube Iframes
  // [SỬA] Lệnh này trước đây không có tác dụng vì iframe thiếu enablejsapi=1 (nay đã thêm khi tạo iframe)
  const allIframes = document.querySelectorAll('iframe.js-video');
  allIframes.forEach(iframe => {
    if (iframe.contentWindow) {
      iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    }
  });
}

// [MỚI] YouTube chỉ được nạp khi bấm vào ảnh bìa (xem renderSection trong script.js).
// Chỉ giữ 1 player sống tại một thời điểm; các player khác trả về ảnh bìa để giải phóng bộ nhớ.
function activateYouTube(facade) {
  document.querySelectorAll('iframe.js-video').forEach(old => {
    if (old._facade) old.replaceWith(old._facade);
  });
  document.querySelectorAll('video.js-video').forEach(video => video.pause());

  const src = facade.dataset.src;
  const iframe = document.createElement('iframe');
  iframe.className = 'js-video';
  iframe.src = src + (src.indexOf('?') === -1 ? '?' : '&') + 'autoplay=1&enablejsapi=1';
  iframe.title = facade.getAttribute('aria-label') || 'YouTube video';
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.allowFullscreen = true;
  iframe._facade = facade;
  facade.replaceWith(iframe);
}

document.addEventListener('click', function (e) {
  const facade = e.target.closest && e.target.closest('.yt-facade');
  if (facade) activateYouTube(facade);
});

// Lắng nghe sự kiện Play
document.addEventListener('play', function (e) {
  // Nếu một video MP4 cục bộ được bật, dừng các cái khác
  if (e.target.tagName === 'VIDEO') {
    const allVideos = document.querySelectorAll('video.js-video');
    allVideos.forEach(video => {
      if (video !== e.target) video.pause();
    });

    // Dừng luôn cả YouTube
    const allIframes = document.querySelectorAll('iframe.js-video');
    allIframes.forEach(iframe => {
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      }
    });
  }
}, true);

/* ==================== THANH TRẠNG THÁI ==================== */
document.addEventListener('DOMContentLoaded', () => {
  const bar = document.getElementById('status-bar');
  const btn = document.getElementById('toggle-btn');

  if (btn && bar) { // Kiểm tra xem phần tử có tồn tại không
    btn.onclick = function () {
      bar.classList.toggle('collapsed');
      const collapsed = bar.classList.contains('collapsed');
      this.innerText = collapsed ? '▶' : '◀';
      this.setAttribute('aria-expanded', String(!collapsed)); // [MỚI]
    };
  }

});

/* ==================== DIFY CHATBOT ==================== */
window.difyChatbotConfig = {
  token: 'pgcinwP29itISvIM',
  // [SỬA] BẮT BUỘC khi nạp script Dify sau sự kiện load: nếu thiếu, embed.min.js chỉ chờ document.body.onload
  // (đã xảy ra rồi) nên bong bóng chat không bao giờ xuất hiện. Đã kiểm chứng với mã nguồn embed.js của Dify.
  dynamicScript: true,
  inputs: {
    // You can define the inputs from the Start node here
    // key is the variable name
    // e.g.
    // name: "NAME"
  },
  systemVariables: {
    // user_id: 'YOU CAN DEFINE USER ID HERE',
    // conversation_id: 'YOU CAN DEFINE CONVERSATION ID HERE, IT MUST BE A VALID UUID',
  },
  userVariables: {
    // avatar_url: 'YOU CAN DEFINE USER AVATAR URL HERE',
    // name: 'YOU CAN DEFINE USER NAME HERE',
  },
}

// [SỬA] Script embed của Dify (udify.app) trước đây nằm trong <head> nên làm chậm DOMContentLoaded
// (script defer chạy trước sự kiện đó) và làm loader chờ lâu. Nay nạp sau khi trang load xong, lúc trình duyệt rảnh.
// Vẫn là đúng script + id như cũ; bong bóng chat chỉ xuất hiện trễ khoảng 1–2 giây.
// Lưu ý: cần dynamicScript: true ở difyChatbotConfig (xem trên), nếu không bong bóng sẽ KHÔNG xuất hiện.
function loadChatbotLater() {
  const load = () => {
    const s = document.createElement('script');
    s.src = 'https://udify.app/embed.min.js';
    s.id = window.difyChatbotConfig.token;
    s.defer = true;
    // Dự phòng: nếu phiên bản embed nào đó vẫn chờ body.onload (không hiểu dynamicScript) thì tự gọi hàm khởi tạo của nó
    s.onload = () => {
      if (!document.getElementById('dify-chatbot-bubble-button') && typeof document.body.onload === 'function') {
        document.body.onload();
      }
    };
    document.body.appendChild(s);
  };
  if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 3000 });
  else setTimeout(load, 1500);
}
