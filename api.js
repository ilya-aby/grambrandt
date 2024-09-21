import { config } from './config.js';

export async function fetchArtwork() {
  const fields = [
    'id', 'artist_title', 'artist_id', 'date_start', 'date_end',
    'date_display', 'medium_display', 'artwork_type_title',
    'place_of_origin', 'short_description', 'title', 'image_id',
    'dimensions_detail'
  ];

  const query = {
    bool: {
      must: [
        { term: { has_not_been_viewed_much: config.showObscure } },
        { exists: { field: "artist_id" } },
        { exists: { field: "image_id" } },
        { term: { artwork_type_id: config.artworkTypeId } }
      ],
      must_not: [
        { terms: { id: config.seenArtworkIds } }
      ]
    }
  };

  if (config.requireShortDescription) {
    query.bool.must.push({ exists: { field: "short_description" } });
  }

  if (config.minYear !== null) {
    query.bool.must.push({ range: { date_start: { gte: config.minYear } } });
  }

  if (config.maxYear !== null) {
    query.bool.must.push({ range: { date_end: { lte: config.maxYear } } });
  }

  try {
    const response = await fetch('https://api.artic.edu/api/v1/artworks/search', {
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
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    const iiifUrl = data.config.iiif_url;
    const webUrl = data.config.website_url;
    const newArtworks = data.data.filter(artwork => {
      // Always add the ID to seenArtworkIds, regardless of whether we keep or exclude the artwork
      config.seenArtworkIds.push(artwork.id);

      // Check dimensions and exclude if height is more than 2.5 times the width
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
  } catch (error) {
    console.error('Error fetching artwork:', error);
    return [];
  }
}