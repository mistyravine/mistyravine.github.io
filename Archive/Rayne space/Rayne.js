document.addEventListener('DOMContentLoaded', () => {
            const nowSection = document.querySelector('.now-section');
            const nowToggle = document.getElementById('now-toggle');
            const nowContent = document.querySelector('.now-content'); // Get the content element
            const storageKey = 'nowSectionCollapsed';

            // Function to save the state to local storage
            function saveState() {
                const isCollapsed = nowSection.classList.contains('collapsed');
                localStorage.setItem(storageKey, isCollapsed);
            }

            // Function to load the state from local storage
            function loadState() {
                const isCollapsed = localStorage.getItem(storageKey) === 'true';
                if (isCollapsed) {
                    nowSection.classList.add('collapsed');
                    // Ensure content is actually hidden on load if collapsed
                    if (nowContent) {
                        nowContent.style.maxHeight = '0';
                        nowContent.style.opacity = '0';
                    }
                } else {
                    nowSection.classList.remove('collapsed');
                     // Ensure content is visible on load if not collapsed
                    if (nowContent) {
                        nowContent.style.maxHeight = '500px'; // Or appropriate full height
                        nowContent.style.opacity = '1';
                    }
                }
            }

            // Toggle the collapsed state on click
            if (nowToggle) { // Ensure nowToggle exists before adding listener
                nowToggle.addEventListener('click', () => {
                    nowSection.classList.toggle('collapsed');
                    // Manually control max-height and opacity for smooth transition
                    if (nowSection.classList.contains('collapsed')) {
                        if (nowContent) {
                            nowContent.style.maxHeight = '0';
                            nowContent.style.opacity = '0';
                        }
                    } else {
                        if (nowContent) {
                            nowContent.style.maxHeight = '500px'; // Adjust this value to be larger than your content
                            nowContent.style.opacity = '1';
                        }
                    }
                    saveState();
                });
            }

            // Load the initial state when the page loads
            loadState();
        });