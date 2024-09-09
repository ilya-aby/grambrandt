let artworkTypeId = 1 // 1 = Painting, 2 = Photograph
let requireShortDescription = true
let seenArtworkIds = [];

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
    likesString: ((Math.floor(Math.random() * 801 + 100) / 100).toFixed(1) + 'K'),
    commentsString: Math.floor(Math.random() * 90 + 10).toString(),
    sharesString: Math.floor(Math.random() * 900 + 100).toString()
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
                <img class="icon" src="images/icon-heart.png" alt="heart Icon">
                <p class="bold-text">${engagement.likesString}</p>
              </div>
              <div class="action-group">
                <img class="icon" src="images/icon-comment.png" alt="comment Icon">
                <p class="bold-text">${engagement.commentsString}</p>
              </div>
              <div class="action-group">
                <img class="icon" src="images/icon-dm.png" alt="dm Icon">
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

  // Add event listeners to the new ellipsis buttons
  document.querySelectorAll('.ellipsis-button').forEach(button => {
    button.addEventListener('click', function () {
      const title = this.getAttribute('data-title');
      const artist = this.getAttribute('data-artist');
      openModal(title, artist);
    });
  });
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
    'place_of_origin', 'short_description', 'title', 'image_id'
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
      const newArtworks = data.data.map(artwork => {
        seenArtworkIds.push(artwork.id); // Add the ID to seenArtworkIds
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

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  });

  document.body.appendChild(modal);
}

function closeModal(modal) {
  modal.remove();
}
