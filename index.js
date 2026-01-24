
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
window.addEventListener("load", () => {
  const loader = document.querySelector("#loader");
  loader.classList.add("loader-hidden");
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
