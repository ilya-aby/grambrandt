// Render a single Instagram-style post card from an artwork object
export function renderCard(artwork) {
  
  const { id, 
    artist_id, 
    title, 
    artist_title, 
    medium_display, 
    short_description, 
    date_start, 
    date_end, 
    place_of_origin, 
    image_url, 
    web_url 
  } = artwork;

  const { username, avatarInitials, backgroundColor } = getInstagramInfoForArtistName(artist_title);
  const { numLikes, numComments, numShares } = getRandomEngagement();

  const postCaption = generatePostCaption(title, medium_display, short_description);
  const yearsAgo = getYearsAgoString(date_start, date_end);

  return `
    <div class="container">
      <div class="post">
        <div class="post-header">
          <div class="user-avatar" style="background-color: ${backgroundColor};">
            <span class="initials">${avatarInitials}</span>
          </div>
          <div class="user-info">
            <a class="bold-text" href="https://www.artic.edu/artists/${artist_id}" target="_blank" rel="noopener">${artist_title}</a>
            <p class="small-text">${place_of_origin}</p>
          </div>
          <button class="ellipsis-button" data-title="${title}" data-artist="${artist_title}" aria-label="More information">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="3" cy="8" r="1.5" fill="white"/>
              <circle cx="8" cy="8" r="1.5" fill="white"/>
              <circle cx="13" cy="8" r="1.5" fill="white"/>
            </svg>
          </button>
        </div>
        <img class="post-image" src="${image_url}" alt="${title} by ${artist_title}" onerror="handleImageError(this)">
        <div class="post-footer">
          <div class="actions">
            <div class="action-group">
              <svg class="icon" data-like-id="${id}" fill="currentColor" stroke="none" aria-label="Like" role="img" viewBox="0 0 24 24">
                <title>Like</title>
                <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path>
              </svg>
              <p class="bold-text">${numLikes}</p>
            </div>
            <div class="action-group">
              <svg class="icon" fill="none" stroke="currentColor" aria-label="Comment" role="img" viewBox="0 0 24 24">
                <title>Comment</title>
                <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" stroke-width="2"></path>
              </svg>
              <p class="bold-text">${numComments}</p>
            </div>
            <div class="action-group">
              <svg class="icon" data-share-info='${JSON.stringify({
                url: web_url,
                title: title,
                artist: artist_title
              })}' fill="whitesmoke" stroke="none" aria-label="Share" role="img" viewBox="0 0 24 24">
                <title>Share</title>
                <line fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2" x1="22" x2="9.218" y1="3" y2="10.083"></line>
                <polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" stroke-linejoin="round" stroke-width="2"></polygon>
              </svg>
              <p class="bold-text">${numShares}</p>
            </div>
          </div>
          <p class="light-text caption"><span class="bold-text">${username}</span> ${postCaption}</p>
          <p class="small-text gray-text">${yearsAgo}</p>
        </div>
      </div>
    </div>
    `;
}

// Helper function to "Instagramify" artist to username, avatar initials & random background color
function getInstagramInfoForArtistName(name) {
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

  // Randomize background color
  const backgroundColor = `hsl(${Math.floor(Math.random() * 360)}, 60%, 30%)`;

  return { username, avatarInitials, backgroundColor };
}

// Helper function to create a "X years ago" string for artwork creation years
function getYearsAgoString(dateStart, dateEnd) {
  const yearDifference = new Date().getFullYear() - Math.round((dateStart + dateEnd) / 2);
  return yearDifference === 1 ? "1 year ago" : `${yearDifference} years ago`;
}

// Helper function to create random engagement numbers for posts
function getRandomEngagement() {
  return {
    numLikes: Math.floor(Math.random() * 900 + 100),
    numComments: Math.floor(Math.random() * 90 + 10),
    numShares: Math.floor(Math.random() * 90 + 10)
  };
}

// Helper function to generate a post caption used in the post footer
function generatePostCaption(title, mediumDisplay, shortDescription) {
  return `<em>${title}</em>, ${mediumDisplay.replace(/^\w/, c => c.toLowerCase())}. ${shortDescription}`;
}