// vr-script.js
let player;
let isMuted = true;
let initialClickDone = false; // Flag to prevent multiple triggers

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: 'oVAp5UDnsPI', // Example Video ID
        playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            loop: 1,
            modestbranding: 1,
            mute: 1, // Start muted
            playlist: 'oVAp5UDnsPI' // Needed for loop=1
        },
        events: {
            'onReady': onPlayerReady,
            'onError': onPlayerError,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    // Player is ready, but might still be muted depending on browser policy
    preloadBackgroundImage();
}

function onPlayerError(event) {
    console.error('YouTube Player Error:', event.data);
    document.getElementById('message').textContent = 'Error loading audio. Please refresh.';
    document.getElementById('loading').style.display = 'none'; // Hide loading on error too
}

function onPlayerStateChange(event) {
    // You could potentially hide the loading indicator here too,
    // but preloading the image is usually faster.
    // if (event.data === YT.PlayerState.PLAYING) { }
}

function preloadBackgroundImage() {
    const img = new Image();
    const wallpaperContainer = document.getElementById('wallpaper-container');
    // Get the URL from the CSS (more robust than hardcoding)
    const style = window.getComputedStyle(wallpaperContainer);
    const bgImageProp = style.backgroundImage;
    // Extract URL from 'url("...")'
    const urlMatch = bgImageProp.match(/url\(["']?(.+?)["']?\)/);

    if (urlMatch && urlMatch[1]) {
        img.src = urlMatch[1];
        img.onload = () => {
            console.log('Background image preloaded.');
            document.getElementById('loading').style.display = 'none';
        };
        img.onerror = () => {
            console.error('Failed to load background image');
            document.getElementById('message').textContent += ' (Background failed)';
            document.getElementById('loading').style.display = 'none';
        };
    } else {
        console.warn('Could not extract background image URL from CSS.');
        // Fallback or just hide loading immediately if URL extraction fails
         document.getElementById('loading').style.display = 'none';
    }
}

function toggleAudio() {
    if (!player || typeof player.mute !== 'function') return; // Check if player is ready

    if (isMuted) {
        player.unMute();
        document.getElementById('audio-control').textContent = '🔊';
    } else {
        player.mute();
        document.getElementById('audio-control').textContent = '🔇';
    }
    isMuted = !isMuted;
}

// --- Main Click Event Listener ---
document.addEventListener('click', () => {
    // Only run this sequence on the very first click
    if (initialClickDone || !player || typeof player.playVideo !== 'function') {
        return;
    }
    initialClickDone = true; // Set the flag

    try {
        // Start playing audio (might require unmuting first)
        if (isMuted) { // Unmute if needed before playing
             player.unMute();
             document.getElementById('audio-control').textContent = '🔊';
             isMuted = false;
        }
        player.playVideo(); // Ensure video plays

        // Fade out the message
        document.getElementById('message').style.opacity = '0';
        document.getElementById('message').style.pointerEvents = 'none'; // Ensure it's not interactable after fading

        // Change cursor back to default
        document.body.style.cursor = 'default';

        // Show and Fade in the main content area and its children
        const mainContentArea = document.getElementById('main-content-area');
        const profileCard = document.getElementById('profile-card');
        const postingContainer = document.getElementById('posting-container');

        mainContentArea.style.display = 'flex'; // Make the container visible

        // Use setTimeout to allow the display property change to render before starting opacity transition
        setTimeout(() => {
            profileCard.style.opacity = '0.7'; // Fade in to initial opacity
            postingContainer.style.opacity = '0.7'; // Fade in to initial opacity
            // Update hover opacity in CSS if you want different values, e.g., 0.9
        }, 50); // Small delay

    } catch (error) {
        console.error('Error during initial click sequence:', error);
        // Handle potential errors, e.g., if the player isn't fully ready
        document.getElementById('message').textContent = 'An error occurred.';
    }
});

// --- Audio Button Click ---
document.getElementById('audio-control').addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent click on button from triggering the document click listener
    toggleAudio();
});

// --- Initial Load Check ---
window.addEventListener('load', () => {
    // Check if YT object exists after load. If not, the API script likely failed.
    if (typeof YT === 'undefined' || !YT) {
         document.getElementById('loading').style.display = 'none'; // Hide loading
         document.getElementById('message').textContent = 'YouTube player API failed to load. Check connection or ad-blockers.';
         console.error("YouTube IFrame API failed to load.");
    } else {
        // API loaded, onYouTubeIframeAPIReady will be called automatically
    }
     preloadBackgroundImage(); // Preload image regardless of YT API status
});

// Ensure onYouTubeIframeAPIReady is globally accessible
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;