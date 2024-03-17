
    document.addEventListener('DOMContentLoaded', function() {
      const sentence = "This is love true face!";
      const typewriterElement = document.getElementById('typewriter');
      const cursorElement = document.getElementById('cursor');
      let charIndex = 0;

      function typeWriter() {
        const currentChar = sentence.charAt(charIndex);
        typewriterElement.innerHTML += currentChar === ' ' ? '&nbsp;' : currentChar;
        charIndex++;

        if (charIndex < sentence.length) {
          setTimeout(typeWriter, 100); // Adjust the delay (in milliseconds) between letters
        }
      }

      typeWriter();
    });
