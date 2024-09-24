import { fetchArtwork } from './api.js';
import { config } from './config.js';
import { createModal } from './modal.js';
import { renderCard } from './render.js';

// Event listener to handle clicks on ellipsis buttons and action buttons for a post
document.addEventListener('click', function (event) {
  const ellipsisButton = event.target.closest('.ellipsis-button');
  if (ellipsisButton) {
    openArtDetailModal(ellipsisButton.getAttribute('data-title'), ellipsisButton.getAttribute('data-artist'));
  }

  const likeButton = event.target.closest('[data-like-id]');
  if (likeButton) {
    handleLikeClick(likeButton);
  }

  const shareButton = event.target.closest('[data-share-info]');
  if (shareButton) {
    handleShareClick(shareButton);
  }

  const configButton = event.target.closest('.config-button');
  if (configButton) {
    openConfigModal();
  }
});

function handleLikeClick(likeButton) {
  const artworkId = likeButton.getAttribute('data-like-id');
  const likeCount = likeButton.nextElementSibling;
    // Toggle like status and update count
    if (likeButton.classList.contains('liked')) {
      // Currently liked, perform unlike
      likeCount.textContent = (parseInt(likeCount.textContent) - 1).toString();
      likeButton.classList.remove('liked');
    } else {
      // Currently not liked, perform like
      likeCount.textContent = (parseInt(likeCount.textContent) + 1).toString();
      likeButton.classList.add('liked');
  } 
}

function handleShareClick(shareButton) {
  const shareData = JSON.parse(shareButton.getAttribute('data-share-info'));
  const { url, title, artist } = shareData;
  
  if (navigator.share) {
    navigator.share({
      title: `"${title}" by ${artist}, found on Grambrandt`,
      url: url
    }).catch(() => {
      // Silently handle any errors
    });
  } 
}

// Helper to randomize the order of artworks from API
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Occasionally we get back a bad image URL from the API because we're requesting a size that's
// not supported, resulting in a 402 error. This function attempts to fix the URL by requesting a 
// "100%" size instead of the fixed size that the API docs recommend using as the default.
function handleImageError(img) {
  const url = new URL(img.src);
  const fullIndex = url.pathname.indexOf('/full/');
  
  if (fullIndex !== -1) {
    url.pathname = url.pathname.slice(0, fullIndex) + '/full/pct:100/0/default.jpg';
    img.src = url.toString();
  } else {
    img.src = '/images/placeholder.jpg';
  }
  
  img.onerror = null;
}

// Attach to the global window object
window.handleImageError = handleImageError;

// Render posts to the DOM with data from the API
// Include a sentinel div to trigger infinite scroll when reached
function renderPosts(artworks) {
  const postContent = artworks.map(artwork => renderCard(artwork)).join('');
  document.querySelector("main").insertAdjacentHTML('beforeend', postContent);
  addSentinel();
}

// Show loading spinner when initial artworks are fetched
function showLoadingSpinner() {
  let spinner = document.querySelector(".spinner");
  if (!spinner) {
    spinner = document.createElement('div');
    spinner.className = 'spinner';
    document.querySelector("main").appendChild(spinner);
  }
  spinner.style.display = 'block';
}

// Hide loading spinner when artworks are fetched
function hideLoadingSpinner() {
  const spinner = document.querySelector(".spinner");
  if (spinner) {
    spinner.style.display = 'none';
  }
}

// Invisible sentinel div to trigger infinite scroll
function addSentinel() {
  const main = document.querySelector("main");
  let sentinel = document.querySelector('.sentinel');
  if (sentinel) {
    sentinel.remove();
  }
  sentinel = document.createElement('div');
  sentinel.className = 'sentinel';
  main.appendChild(sentinel);
}

// Fetch artworks from the API and render them to the DOM
async function fetchAndRenderArtworks(isInitialLoad = false) {
  if (isInitialLoad) {
    showLoadingSpinner();
  }
  try {
    const artworks = await fetchArtwork();
    if (artworks.length > 0) {
      hideLoadingSpinner();

      // Create a copy of the array to shuffle
      const arrayToShuffle = [...artworks];

      // Shuffle and render the copy
      shuffleArray(arrayToShuffle);
      renderPosts(arrayToShuffle);

      // Set up intersection observer after initial load
      if (isInitialLoad) {
        setupInfiniteScroll();
      } else {
        // Re-observe the sentinel for subsequent loads
        observeSentinel(window.infiniteScrollObserver);
      }
    } else {
      hideLoadingSpinner();
    }
  } catch (error) {
    console.error('Error in fetchAndRenderArtworks:', error);
    hideLoadingSpinner();
  }
}

// Set up intersection observer to trigger infinite scroll
function setupInfiniteScroll() {
  const options = {
    root: null,
    rootMargin: '1000px',
    threshold: 0
  };

  window.infiniteScrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        window.infiniteScrollObserver.unobserve(entry.target);
        fetchAndRenderArtworks();
      }
    });
  }, options);

  observeSentinel(window.infiniteScrollObserver);
}

// Observe the sentinel div to trigger infinite scroll
function observeSentinel(observer) {
  const sentinel = document.querySelector('.sentinel');
  if (sentinel && observer) {
    observer.observe(sentinel);
  }
}

// Open the art detail modal with Perplexity links
function openArtDetailModal(title, artist) {
  const perplexityUrlWork = `https://www.perplexity.ai/search?s=o&q=${encodeURIComponent(`Tell me about "${title}" by ${artist}`)}`;
  const perplexityUrlArtist = `https://www.perplexity.ai/search?s=o&q=${encodeURIComponent(`Tell me about the artist ${artist}`)}`;

  const content = `
    <a href="${perplexityUrlWork}" target="_blank" rel="noopener">Ask Perplexity about this work</a>
    <a href="${perplexityUrlArtist}" target="_blank" rel="noopener">Ask Perplexity about this artist</a>
  `;

  const modal = createModal(content);
}

// Open the config modal to allow users to customize the artwork displayed
function openConfigModal() {
  const content = `
    <div class="switch-container">
      <label for="showPaintingsSwitch">Show paintings</label>
      <label class="switch">
        <input type="checkbox" id="showPaintingsSwitch" ${config.artworkTypeIds.includes(1) ? 'checked' : ''}>
        <span class="slider"></span>
      </label>
    </div>
    <div class="switch-container">
      <label for="showPhotographsSwitch">Show photographs</label>
      <label class="switch">
        <input type="checkbox" id="showPhotographsSwitch" ${config.artworkTypeIds.includes(2) ? 'checked' : ''}>
        <span class="slider"></span>
      </label>
    </div>
    <div class="switch-container">
      <label for="showObscureSwitch">Include more obscure art</label>
      <label class="switch">
        <input type="checkbox" id="showObscureSwitch" ${config.showObscure ? 'checked' : ''}>
        <span class="slider"></span>
      </label>
    </div>
  `;
  const modal = createModal(content);

  // Add event listener for modal close
  modal.addEventListener('close', updateConfigAndRerender);
}

function updateConfigAndRerender() {
  const showPaintings = document.getElementById('showPaintingsSwitch').checked;
  const showPhotographs = document.getElementById('showPhotographsSwitch').checked;
  const showObscure = document.getElementById('showObscureSwitch').checked;

  const newArtworkTypeIds = [];
  if (showPaintings) newArtworkTypeIds.push(1);
  if (showPhotographs) newArtworkTypeIds.push(2);

  const configChanged = 
    !arraysEqual(config.artworkTypeIds, newArtworkTypeIds) ||
    config.showObscure !== showObscure;

  if (configChanged) {
    config.artworkTypeIds = newArtworkTypeIds;
    config.showObscure = showObscure;
    config.seenArtworkIds = [];
    
    // Clear existing content
    document.querySelector('main').innerHTML = '';
    
    // Re-fetch and render artworks
    fetchAndRenderArtworks(true);
  }
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
}

// Fetch and render artworks on page load
fetchAndRenderArtworks(true);