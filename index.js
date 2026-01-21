
function openTab(evt, categoryName) {
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
var player;

// Load YouTube API
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Initialize the player
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '0',
    width: '0',
    videoId: 'pvb2zsYkpzA', // Replace with your YouTube ID
  });
}

// Function called by image click
function playYT() {
  if (player) {
    var state = player.getPlayerState();
    // If playing (1), then pause (2). Otherwise, play.
    if (state == 1) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
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
