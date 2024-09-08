// Helper to randomize the order of artworks from API
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

// Transforms artist name into username, avatar initials, and random background color
function createUserInfo(name) {
  const cleanedName = name.replace(/['"-()]/g, '');
  const words = cleanedName.split(' ');
  const lastName = words.pop().toLowerCase();
  const initials = words.map(word => word[0].toLowerCase()).join('');
  const username = initials + lastName;
  
  const avatarInitials = (words[0][0] + lastName[0]).toUpperCase();
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
      const postCaption = `<em>${artwork.title}</em>, ${artwork.medium_display}. ${artwork.short_description}`;
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
                      <a class="bold-text" href="https://www.artic.edu/artists/${artwork.artist_id}" target="_blank" rel="noopener noreferrer">${artwork.artist_title}</a>
                      <p class="small-text">${artwork.place_of_origin}</p>
                  </div>
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
  fetchArtworkIds().then(artworks => {
      console.log('Fetched artwork IDs:', artworks);
      if (artworks.length > 0) {
          const artworkIds = artworks.map(artwork => artwork.id);
          fetchArtworkInfo(artworkIds).then(artworkInfoArray => {
              console.log('Fetched artwork metadata:', artworkInfoArray);
              hideLoadingSpinner();

              // Create a copy of the array to shuffle
              const arrayToShuffle = [...artworkInfoArray];

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
          });
      } else {
          hideLoadingSpinner();
      }
  });
}

// Function to set up infinite scroll
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

// Function to observe the sentinel
function observeSentinel(observer) {
    const sentinel = document.querySelector('.sentinel');
    if (sentinel && observer) {
        observer.observe(sentinel);
    }
}

document.addEventListener('DOMContentLoaded', () => fetchAndRenderArtworks(true));

function fetchArtworkIds() {
  return fetch('https://api.artic.edu/api/v1/artworks/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
          query: {
              bool: {
                  must: [
                      { term: { has_not_been_viewed_much: false } },
                      { exists: { field: "artist_id" } },
                      { exists: { field: "short_description" } },
                      { terms: { artwork_type_id: [1, 2] } }
                  ]
              }
          },
          fields: ["id", "title"],
          limit: 12,
          sort: [{ "_script": { "type": "number", "script": "Math.random()", "order": "asc" } }]
      })
  })
  .then(response => response.ok ? response.json() : Promise.reject(`HTTP error! status: ${response.status}`))
  .then(data => data.data.map(({ id, title }) => ({ id, title })))
  .catch(error => console.error('Error fetching artwork IDs:', error));
}
  
function fetchArtworkInfo(artworkIds) {
    const fields = [
        'id', 
        'artist_title', 
        'artist_id',
        'date_start',
        'date_end',
        'date_display', 
        'medium_display',
        'artwork_type_title',
        'place_of_origin', 
        'short_description',
        'title',
        'image_id'
    ];
    const fieldsParam = fields.join(',');
    const idsParam = artworkIds.join(',');
    const url = `https://api.artic.edu/api/v1/artworks?ids=${idsParam}&fields=${fieldsParam}`;
    
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const artworks = data.data;
            const iiifUrl = data.config.iiif_url;
            const webUrl = data.config.website_url;
            
            // Construct the image URL for each artwork if image_id is available
            return artworks.map(artwork => {
                if (artwork.image_id) {
                    artwork.image_url = `${iiifUrl}/${artwork.image_id}/full/843,/0/default.jpg`;
                    artwork.web_url = `${webUrl}/artworks/${artwork.id}`;
                }
                artwork.place_of_origin = artwork.place_of_origin || ''; // Handle missing place_of_origin
                return artwork;
            });
        })
        .catch(error => {
            console.error('Error fetching artwork info:', error);
        });
}
