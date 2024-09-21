let artworkTypeId = 1 // 1 = Painting, 2 = Photograph
let requireShortDescription = true
let seenArtworkIds = [];

// Add event listener to handle clicks on ellipsis buttons and like buttons for a post
document.addEventListener('click', function (event) {
  const ellipsisButton = event.target.closest('.ellipsis-button');
  if (ellipsisButton) {
    openModal(ellipsisButton.getAttribute('data-title'), ellipsisButton.getAttribute('data-artist'));
  }

  const likeButton = event.target.closest('[data-like-id]');
  if (likeButton) {
    handleLikeClick(likeButton);
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
      console.log('Unliked artwork ID:', artworkId);
    } else {
      // Currently not liked, perform like
      likeCount.textContent = (parseInt(likeCount.textContent) + 1).toString();
      likeButton.classList.add('liked');
      console.log('Liked artwork ID:', artworkId);
  } 
}

// Helper to randomize the order of artworks from API
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Transforms artist name into username, avatar initials, and random background color
function createUserInfo(name) {
  const cleanedName = name.replace(/['"\-()]/g, '').trim();
  const words = cleanedName.split(' ').filter(word => word.length > 0);

  let username, avatarInitials;

  if (words.length === 0) {
    username = 'Unknown';
    avatarInitials = 'UN';
  } else if (words.length === 1) {
    username = words[0].toLowerCase();
    avatarInitials = words[0].slice(0, 2).toUpperCase();
  } else {
    const lastName = words.pop().toLowerCase();
    const initials = words.map(word => word[0].toLowerCase()).join('');
    username = initials + lastName;
    avatarInitials = (words[0][0] + lastName[0]).toUpperCase();
  }

  const backgroundColor = `hsl(${Math.floor(Math.random() * 360)}, 60%, 30%)`;

  return { username, avatarInitials, backgroundColor };
}

// Transforms art creation years into "X years ago" for post
function createYearsAgoString(dateStart, dateEnd) {
  const yearDifference = new Date().getFullYear() - Math.round((dateStart + dateEnd) / 2);
  return yearDifference === 1 ? "1 year ago" : `${yearDifference} years ago`;
}

// Create random engagement numbers
function createRandomEngagement() {
  return {
    likesString: Math.floor(Math.random() * 900 + 100).toString(),
    commentsString: Math.floor(Math.random() * 90 + 10).toString(),
    sharesString: Math.floor(Math.random() * 90 + 10).toString()
  };
}

function renderPosts(artworks) {
  const main = document.querySelector("main");
  const postContent = artworks.map(artwork => {
    const { username, avatarInitials, backgroundColor } = createUserInfo(artwork.artist_title);
    const postCaption = `<em>${artwork.title}</em>, ${artwork.medium_display.replace(/^\w/, c => c.toLowerCase())}. ${artwork.short_description}`;
    const yearsAgo = createYearsAgoString(artwork.date_start, artwork.date_end);
    const engagement = createRandomEngagement();

    return `
      <div class="container">
        <div class="post">
          <div class="post-header">
            <div class="user-avatar" style="background-color: ${backgroundColor};">
              <span class="initials">${avatarInitials}</span>
            </div>
            <div class="user-info">
              <a class="bold-text" href="https://www.artic.edu/artists/${artwork.artist_id}" target="_blank" rel="noopener">${artwork.artist_title}</a>
              <p class="small-text">${artwork.place_of_origin}</p>
            </div>
            <button class="ellipsis-button" data-title="${artwork.title}" data-artist="${artwork.artist_title}" aria-label="More information">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="3" cy="8" r="1.5" fill="white"/>
                <circle cx="8" cy="8" r="1.5" fill="white"/>
                <circle cx="13" cy="8" r="1.5" fill="white"/>
              </svg>
            </button>
          </div>
          <img class="post-image" src="${artwork.image_url}" alt="Post Image">
          <div class="post-footer">
            <div class="actions">
              <div class="action-group">
                <svg class="icon" data-like-id="${artwork.id}" fill="currentColor" stroke="none" aria-label="Like" role="img" viewBox="0 0 24 24">
                  <title>Like</title>
                  <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path>
                </svg>
                <p class="bold-text">${engagement.likesString}</p>
              </div>
              <div class="action-group">
                <svg class="icon" fill="none" stroke="currentColor" aria-label="Comment" role="img" viewBox="0 0 24 24">
                  <title>Comment</title>
                  <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" stroke-width="2"></path>
                </svg>
                <p class="bold-text">${engagement.commentsString}</p>
              </div>
              <div class="action-group">
                <svg class="icon" fill="whitesmoke" stroke="none" aria-label="Share" role="img" viewBox="0 0 24 24">
                  <title>Share</title>
                  <line fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2" x1="22" x2="9.218" y1="3" y2="10.083"></line>
                  <polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" stroke-linejoin="round" stroke-width="2"></polygon>
                </svg>
                <p class="bold-text">${engagement.sharesString}</p>
              </div>
            </div>
            <p class="light-text caption"><span class="bold-text">${username}</span> ${postCaption}</p>
            <p class="small-text gray-text">${yearsAgo}</p>
          </div>
        </div>
      </div>
      `;
  }).join('');

  main.insertAdjacentHTML('beforeend', postContent);
  addSentinel();
}

function showLoadingSpinner() {
  let spinner = document.querySelector(".spinner");
  if (!spinner) {
    spinner = document.createElement('div');
    spinner.className = 'spinner';
    document.querySelector("main").appendChild(spinner);
  }
  spinner.style.display = 'block';
}

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

// Function to fetch and render artworks
function fetchAndRenderArtworks(isInitialLoad = false) {
  if (isInitialLoad) {
    showLoadingSpinner();
  }
  fetchArtwork().then(artworks => {
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
  });
}

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

  // Observe the sentinel element
  observeSentinel(window.infiniteScrollObserver);
}

function observeSentinel(observer) {
  const sentinel = document.querySelector('.sentinel');
  if (sentinel && observer) {
    observer.observe(sentinel);
  }
}

document.addEventListener('DOMContentLoaded', () => fetchAndRenderArtworks(true));

function fetchArtwork() {
  const fields = [
    'id', 'artist_title', 'artist_id', 'date_start', 'date_end',
    'date_display', 'medium_display', 'artwork_type_title',
    'place_of_origin', 'short_description', 'title', 'image_id',
    'dimensions_detail' // Added this field
  ];

  const query = {
    bool: {
      must: [
        { term: { has_not_been_viewed_much: false } },
        { exists: { field: "artist_id" } },
        { exists: { field: "image_id" } },
        { term: { artwork_type_id: artworkTypeId } }
      ],
      must_not: [
        { terms: { id: seenArtworkIds } }
      ]
    }
  };

  if (requireShortDescription) {
    query.bool.must.push({ exists: { field: "short_description" } });
  }

  return fetch('https://api.artic.edu/api/v1/artworks/search', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'AIC-User-Agent': 'grambrandt.com'
    },
    body: JSON.stringify({
      query: query,
      fields: fields,
      limit: 12,
      sort: [{ "_script": { "type": "number", "script": "Math.random()", "order": "asc" } }]
    })
  })
    .then(response => response.ok ? response.json() : Promise.reject(`HTTP error! status: ${response.status}`))
    .then(data => {
      console.log('API response:', data);
      const iiifUrl = data.config.iiif_url;
      const webUrl = data.config.website_url;
      const newArtworks = data.data.filter(artwork => {
        // Always add the ID to seenArtworkIds, regardless of whether we keep or exclude the artwork
        seenArtworkIds.push(artwork.id);

        // Check dimensions and exclude if height is more than 2.5 times the width
        // Extremely tall paintings break the layout and cause 403 errors from the API
        if (artwork.dimensions_detail && artwork.dimensions_detail.length > 0) {
          const { height, width } = artwork.dimensions_detail[0];
          if (height && width && height > 2.5 * width) {
            return false;
          }
        }
        return true;
      }).map(artwork => {
        return {
          ...artwork,
          image_url: artwork.image_id ? `${iiifUrl}/${artwork.image_id}/full/843,/0/default.jpg` : null,
          web_url: `${webUrl}/artworks/${artwork.id}`,
          place_of_origin: artwork.place_of_origin ?? '',
          short_description: artwork.short_description ?? ''
        };
      });
      return newArtworks;
    })
    .catch(error => {
      console.error('Error fetching artwork:', error);
      return [];
    });
}

// Open modal with Perplexity links
function openModal(title, artist) {
  const perplexityUrlWork = `https://www.perplexity.ai/search?s=o&q=${encodeURIComponent(`Tell me about "${title}" by ${artist}`)}`;
  const perplexityUrlArtist = `https://www.perplexity.ai/search?s=o&q=${encodeURIComponent(`Tell me about the artist ${artist}`)}`;

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
        <div class="modal-content">
            <a href="${perplexityUrlWork}" target="_blank" rel="noopener">Ask Perplexity about this work</a>
            <a href="${perplexityUrlArtist}" target="_blank" rel="noopener">Ask Perplexity about this artist</a>
        </div>
    `;

  // Close modal if clicked on modal or any link inside modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.tagName === 'A') {
      closeModal(modal);
    }
  });

  document.body.appendChild(modal);
}

function closeModal(modal) {
  modal.remove();
}
