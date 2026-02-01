const quoteData = [
    { text: "One day you will fly", author: "#Kalandra", bg: "https://d1lss44hh2trtw.cloudfront.net/assets/article/2022/08/10/kalandracinematic4_feature.jpg" },
    { text: "I shall never doubt the power of innocent dreamers", author: "#Queen Nehellenia", bg: "https://i.ytimg.com/vi/XKK5WUEMfbE/hqdefault.jpg" },
    { text: "Nothing. I felt nothing. No sadness or anger. No joy. No pain. No pleasure. I was free. Free to move, to go where I please. Free of desire. Free to see the universe for what it was. Empty.", author: "#Sirus", bg: "https://i.ytimg.com/vi/O0pwSQbwKPE/maxresdefault.jpg" },
    { text: "If I were you, I'd curse your incompetence!", author: "#Moriya Minakata #Last Blade", bg: "https://www.arcadequartermaster.com/lb2/win_moriya.png" },
    { text: "Nothing can erase my pain", author: "#Magician", bg: "https://i.ytimg.com/vi/PBnwj8WYNaY/hqdefault.jpg" },
];

function loadQuotes() {
    const container = document.getElementById('quotes');
    container.innerHTML = quoteData.map(item => `
  <div class="media-card" style="background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${item.bg}) no-repeat center/cover">
    <p class="quote-style">${item.text}</p>
    <div class="media-footer">${item.author}</div>
  </div>
`).join('');
}

// Call this when the page loads
window.onload = loadQuotes;
const galleryData = {
    images: [
        { src: "images/Celeste.gif", tag: "#Celeste" },
        { src: "images/Patty.gif", tag: "#Patty #Mapple Town" },
        { src: "https://i.ytimg.com/vi/rm8Ctdm3oNM/maxresdefault.jpg", tag: "#Maria" }
    ],
    games: [
        { type: "youtube", src: "https://www.youtube.com/embed/Z2sMGO38nAo", tag: "#Cookie Run" },
        { type: "img", src: "https://assets-prd.ignimgs.com/2024/04/08/persona-1712577088693.png", tag: "#Persona" },
        { type: "video", src: "videos/Lulingqi.mp4", tag: "#Dynasty Warriors" },
        { type: "video", src: "videos/Xushu.mp4", tag: "#Dynasty Warriors" },
        { type: "youtube", src: "https://www.youtube.com/embed/CAL4WMpBNs0", tag: "#Doki Doki" }
    ],
    music: [
        { type: "youtube", src: "https://www.youtube.com/embed/DSvksh6d21w", tag: "#Sacred Play" },
        { type: "video", src: "videos/I don't wanna live without your love.mp4", tag: "#I don't wanna live" },
        { type: "youtube", src: "https://www.youtube.com/embed/ZUDBd-md0VE", tag: "#Sienna" },
        { type: "youtube", src: "https://www.youtube.com/embed/tbIIf6CeXa4", tag: "#Rain Stop" }
    ],
    videos: [
        { type: "youtube", src: "https://www.youtube.com/embed/vZO6Q0RfzS4", tag: "#Mistico" }
    ]
};
function renderAllSections() {
    Object.keys(galleryData).forEach(sectionId => {
        const container = document.getElementById(sectionId);
        if (!container) return;

        container.innerHTML = galleryData[sectionId].map(item => {
            let content = '';
            if (item.type === 'youtube') {
                content = `<iframe class="js-video" src="${item.src}" frameborder="0" allowfullscreen></iframe>`;
            } else if (item.type === 'video') {
                content = `<video class="js-video" controls><source src="${item.src}" type="video/mp4"></video>`;
            } else {
                content = `<img src="${item.src}" alt="${item.tag}">`;
            }

            return `
        <div class="media-card">
          <div class="media-content">${content}</div>
          <div class="media-footer">${item.tag}</div>
        </div>`;
        }).join('');
    });
}
// Call this once the DOM is ready
document.addEventListener('DOMContentLoaded', renderAllSections);