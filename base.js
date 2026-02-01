
function openTab(evt, categoryName) {
  pauseAllMedia();
  // 1. Ẩn tất cả các tab-content
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tab-content");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // 2. Xóa class "active" ở tất cả các nút
  tablinks = document.getElementsByClassName("nav-btn");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // 3. Hiện tab được chọn và thêm class "active" cho nút đó
  document.getElementById(categoryName).style.display = "block";
  evt.currentTarget.className += " active";

  document.querySelector('.media-wrapper').scrollTop = 0;
}
function playMusic() {
  // Lấy element ngay tại thời điểm nhấn nút
  var audio = document.getElementById("localAudio");
  var btnIcon = document.getElementById("btnIcon");
  var btnText = document.getElementById("btnText");

  audio.volume = 0.6;

  if (!audio) return; // Phòng lỗi nếu không tìm thấy file audio

  if (audio.paused) {
    audio.play();
    btnIcon.innerHTML = "⏸";
    btnText.innerHTML = "Pause";
  } else {
    audio.pause();
    btnIcon.innerHTML = "▶";
    btnText.innerHTML = "Play";
  }
}
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('rainContainer');
  const dropCount = 150; // Change this number for more/less rain

  for (let i = 0; i < dropCount; i++) {
    const drop = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    const x = Math.floor(Math.random() * 100);
    const o = Math.random() * 0.8 + 0.2; // Opacity
    const a = Math.random() * 0.5 + 0.5; // Speed
    const d = 0;
    const s = Math.random() * 0.6 + 0.4; // Scale
    const delay = Math.random() * -20;

    drop.setAttribute("class", "rain__drop");
    drop.setAttribute("viewBox", "0 0 5 50");
    drop.setAttribute("preserveAspectRatio", "xMinYMin");

    // Setting the CSS variables
    drop.style.setProperty('--x', x);
    drop.style.setProperty('--o', o);
    drop.style.setProperty('--a', a);
    drop.style.setProperty('--d', d);
    drop.style.setProperty('--s', s);
    drop.style.setProperty('--delay', delay + 's');

    drop.innerHTML = `<path stroke="none" d="M 2.5,0 C 2.6949458,3.5392017 3.344765,20.524571 4.4494577,30.9559 5.7551357,42.666753 4.5915685,50 2.5,50 0.40843152,50 -0.75513565,42.666753 0.55054234,30.9559 1.655235,20.524571 2.3050542,3.5392017 2.5,0 Z"></path>`;

    container.appendChild(drop);
  }
});
window.addEventListener('DOMContentLoaded', () => {
  const images = [
    'images/loader/Shaper.jpg',
    'images/loader/Frill.jpg',
    'https://i.pinimg.com/1200x/4f/bc/c4/4fbcc476f8d0a132b36169542203bde0.jpg',
    'https://i.pinimg.com/1200x/ad/a9/1a/ada91ae3b7ee2205e40d4b118d21c5fe.jpg',
    'https://i.pinimg.com/1200x/a8/0e/7e/a80e7e90f8101eb2ae3c6f1e72afe2e9.jpg'
  ];

  const randomImage = images[Math.floor(Math.random() * images.length)];
  const loaderImg = document.getElementById('loader-bg');

  if (loaderImg) {
    loaderImg.src = randomImage;
  }
});

// Code ẩn loader sau khi trang tải xong (ví dụ)
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.style.opacity = '0';
    loader.style.visibility = 'hidden';
  }, 1500); // Đợi 1.5s cho đẹp
});
// Hàm dừng tất cả video và iframe
function pauseAllMedia() {
  // 1. Dừng tất cả video MP4 cục bộ
  const allVideos = document.querySelectorAll('video.js-video');
  allVideos.forEach(video => video.pause());

  // 2. Dừng tất cả YouTube Iframes
  const allIframes = document.querySelectorAll('iframe.js-video');
  allIframes.forEach(iframe => {
    iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
  });
}

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
      iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    });
  }
}, true);
document.addEventListener('DOMContentLoaded', () => {
    const bar = document.getElementById('status-bar');
    const btn = document.getElementById('toggle-btn');

    if (btn && bar) { // Kiểm tra xem phần tử có tồn tại không
        btn.onclick = function() {
            bar.classList.toggle('collapsed');
            this.innerText = bar.classList.contains('collapsed') ? '▶' : '◀';
        };
    }
});