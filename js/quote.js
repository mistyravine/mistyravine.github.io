const quotes = [
    { quote: "Nothing. I felt nothing. No sadness or anger. No joy. No pain. No pleasure. I was free. Free to move, to go where I please. Free of desire. Free to see the universe for what it was. Empty", author: "- Sirus, Awakener of Worlds -" },
    { quote: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.", author: "- Rumi -" },
    { quote: "Just because someone stumbles and loses their path, doesn't mean they're lost forever.", author: "- Charles Xavier -" },
    { quote: "Without love, the truth cannot be seen", author: "- Umineko -" },
    { quote: "I shall never doubt the power of innocent dreamers", author: "- Queen Nehellenia -" }
  ];
  let currentQuote = 0;

  function displayQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    const authorDisplay = document.getElementById('authorDisplay');
    
    // Set opacity to 0 and then update content to trigger transition
    quoteDisplay.style.opacity = 0;
    authorDisplay.style.opacity = 0;
    
    setTimeout(() => { // Delay to allow transition to take effect
      quoteDisplay.textContent = quotes[currentQuote].quote;
      authorDisplay.textContent = quotes[currentQuote].author;
      
      // Set opacity to 1 to fade in
      quoteDisplay.style.opacity = 1;
      authorDisplay.style.opacity = 1;
    }, 500); // Should match transition duration
  }

  function nextQuote() {
    currentQuote = (currentQuote + 1) % quotes.length;
    displayQuote();
  }

  function prevQuote() {
    currentQuote = (currentQuote - 1 + quotes.length) % quotes.length;
    displayQuote();
  }

  // Initialize with the first quote
  displayQuote();
