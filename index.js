
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