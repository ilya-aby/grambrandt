

// Helper to randomize the order of artworks from API
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

// Generate a username from the artist name
// Takes a full name, uses initials of first name(s) and full last name
// Example: "Vincent van Gogh" becomes "vvangogh"
function createUsername(name) {
    const cleanedName = name.replace(/['"-()]/g, ''); // Remove apostrophes and hyphens
    const words = cleanedName.split(' ');
    const lastName = words.pop().toLowerCase();
    const initials = words.map(word => word[0].toLowerCase()).join('');
    return initials + lastName;
}

// Create an avatar icon from the artist name
// Uses initials of first name(s) and full last name
// Example: "Vincent van Gogh" becomes "VV"
function createAvatarIcon(name) {
    // Generate initials
    const words = name.split(' ');
    const firstInitial = words[0][0];
    const lastInitial = words[words.length - 1][0];
    const initials = (firstInitial + lastInitial).toUpperCase();

    // Generate a random dark color
    const hue = Math.floor(Math.random() * 360);
    const backgroundColor = `hsl(${hue}, 60%, 30%)`;

    // Return an object with the initials and background color
    return { initials, backgroundColor };
}

// Calculate the average year between start and end dates, then return a string
// representing how many years ago that average year was from today
function createYearsAgoString(dateStart, dateEnd) {
    // Calculate the average year
    const averageYear = Math.round((dateStart + dateEnd) / 2);
    
    // Get the current year
    const currentYear = new Date().getFullYear();
    
    // Calculate the difference
    const yearDifference = currentYear - averageYear;
    
    // Return the formatted string
    if (yearDifference === 1) {
        return "1 year ago";
    } else {
        return `${yearDifference} years ago`;
    }
}

// Create random engagement numbers
function createRandomEngagement() {
    const likes = Math.floor(Math.random() * (900 - 100 + 1) + 100);
    const comments = Math.floor(Math.random() * (99 - 10 + 1) + 10);
    const shares = Math.floor(Math.random() * (999 - 100 + 1) + 100);

    const formattedLikes = (likes / 100).toFixed(1) + 'K';

    return {
        likesString: `${formattedLikes}`,
        commentsString: `${comments}`,
        sharesString: `${shares}`
    };
}

function renderPosts(artworks) {

    const main = document.querySelector("main");

    artworks.forEach(artwork => {
        // Create a username and avatar icon from the artist's full name
        const username = createUsername(artwork.artist_title);
        const avatarIcon = createAvatarIcon(artwork.artist_title);

        // Prepend the artwork name & medium into the short description to form the post caption
        const postCaption = `<em>${artwork.title}</em>, ${artwork.medium_display}. ${artwork.short_description}`

        // Create a "years ago" string from the date start and end
        const yearsAgo = createYearsAgoString(artwork.date_start, artwork.date_end);

        // Create random engagement numbers
        const engagement = createRandomEngagement();

        const artistLink = `https://www.artic.edu/artists/${artwork.artist_id}`;

        postContent = `
        <div class="container">
            <div class="post">
                <div class="post-header">
                    <div class="user-avatar" style="background-color: ${avatarIcon.backgroundColor};">
                        <span class="initials">${avatarIcon.initials}</span>
                    </div>
                    <div class="user-info">
                        <a class="bold-text" href="${artistLink}" target="_blank" rel="noopener noreferrer">${artwork.artist_title}</a>
                        <p class="small-text">${artwork.place_of_origin}</p>
                    </div>
                </div>
                <img class="post-image" src="${artwork.image_url}" alt="Post Image">
                <div class="post-footer">
                    <div class="actions">
                        <div class="action-group">
                            <img class="icon" src="images/icon-heart.png" alt="Heart Icon">
                            <p class="bold-text">${engagement.likesString}</p>
                        </div>
                        <div class="action-group">
                            <img class="icon" src="images/icon-comment.png" alt="Comment Icon">
                            <p class="bold-text">${engagement.commentsString}</p>
                        </div>
                        <div class="action-group">
                            <img class="icon" src="images/icon-dm.png" alt="Share Icon">
                            <p class="bold-text">${engagement.sharesString}</p>
                        </div>
                    </div>
                    <p class="light-text caption"><span class="bold-text">${username}</span> ${postCaption}</p>
                    <p class="small-text gray-text">${yearsAgo}</p>
                </div>
            </div>
        </div>
        `

        main.innerHTML += postContent;
    });
}

// Function to show the loading spinner
function showLoadingSpinner() {
    const main = document.querySelector("main");
    main.innerHTML = '<div class="spinner"></div>';
}

// Function to hide the loading spinner
function hideLoadingSpinner() {
    const spinner = document.querySelector(".spinner");
    if (spinner) {
        spinner.remove();
    }
}

// Function to fetch and render artworks
function fetchAndRenderArtworks() {
    showLoadingSpinner();
    fetchArtworkIds().then(artworks => {
        console.log('Fetched artworks:', artworks);
        if (artworks.length > 0) {
            const artworkIds = artworks.map(artwork => artwork.id);
            fetchArtworkInfo(artworkIds).then(artworkInfoArray => {
                console.log('Fetched artwork info for all artworks:', artworkInfoArray);
                hideLoadingSpinner();

                console.log('Order before shuffling:', artworkInfoArray.map(a => a.id));

                // Create a copy of the array to shuffle
                const arrayToShuffle = [...artworkInfoArray];

                // Shuffle and renderthe copy
                shuffleArray(arrayToShuffle);
                renderPosts(arrayToShuffle);
            });
        }
    });
}

// Call fetchAndRenderArtworks when the page loads
document.addEventListener('DOMContentLoaded', fetchAndRenderArtworks);

function fetchArtworkIds() {
    const url = 'https://api.artic.edu/api/v1/artworks/search';
    const body = JSON.stringify({
      query: {
        bool: {
          must: [
            {
              term: {
                has_not_been_viewed_much: false // Only non-obscure artworks
              }
            },
            {
              exists: {
                field: "artist_id"
              }
            },
            {
              exists: {
                field: "short_description"
              }
            },
            {
              terms: {
                artwork_type_id: [1, 2] // 1 = painting, 2 = photograph
              }
            }
          ]
        }
      },
      fields: ["id", "title"],
      limit: 12,
      sort: [
        {
          "_script": {
            "type": "number",
            "script": "Math.random()",
            "order": "asc"
          }
        }
      ]
    });
  
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      return data.data.map(artwork => ({
        id: artwork.id,
        title: artwork.title
      }));
    })
    .catch(error => {
      console.error('Error fetching artwork IDs:', error);
    });
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
