# Grambrandt

[Grambrandt](grambrandt.com) is a parody of Instagram, featuring art from the Art Institute of Chicago. 

Initially built as an exercise for the [Scrimba](scrimba.com) front-end development course and then forked & expanded to use a live API to render real artwork.

![Grambrandt Screenshot](images/grambrandt-animation.gif)

## Features

- Display posts featuring art from the Art Institute of Chicago
- Synthesizes usernames & comments from artist names and curator descriptions of artwork
- Responsive design for mobile & desktop
- Infinite scroll with progressive fetching of more artwork from the API
- Dynamically generated content from JavaScript post objects

## Technologies Used

- Vanilla HTML, CSS, and JavaScript
- No back-end, entirely client-side
- No auth because AIC's API doesn't require it and rate limits by IP

## How It Works

Leverages the excellent [AIC API](https://api.artic.edu/docs/) to fetch a set of artwork IDs matching an ElasticSearch query. Then requests metadata for those artwork IDs to get back image URLs, descriptions, and artist & title. Post-processes that data to make it fit Instagram's layout.

Posts are rendered dynamically in javascript using a template literal in script.js.

## Installation & Usage

1. Can download and open `index.html` directly. There's no back-end
2. To modify to show your own choice of art, you can create your own artworks JSON object in lieu of the AIC API call