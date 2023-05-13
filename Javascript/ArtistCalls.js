var access_token;
import {getAccessToken} from './MainCalls.js';

export async function findArtistID(artistName) {
    if(!access_token || access_token.length == 0)
        access_token = await getAccessToken();

    const artist_name = artistName;

    var url = "https://api.spotify.com/v1/search?type=artist&q=" + artist_name;
    try {
        const artistResponse = await fetch(url, {
            method: "GET",
            headers: {
                'Authorization' :   'Bearer ' + access_token
            },
        });
        
        const artistData = await artistResponse.json();
        const artistId = artistData.artists.items[0].id;
        
        return artistId;
    } catch(error) {
        console.log(error);
        return "";
    }
}

export async function findArtist(artistName) {
    if(!access_token || access_token.length == 0)
        access_token = await getAccessToken();

    const artist_name = artistName;

    var url = "https://api.spotify.com/v1/search?type=artist&q=" + artist_name;
    try {
        const artistResponse = await fetch(url, {
            method: "GET",
            headers: {
                'Authorization' :   'Bearer ' + access_token
            },
        });
        
        const artistData = await artistResponse.json();
        
        return artistData.items;
    } catch(error) {
        console.log(error);
        return "";
    }
}

export async function findRelatedArtists(artistName, artistId) {
    if(!access_token || access_token.length == 0)
        access_token = await getAccessToken();

    var url = "https://api.spotify.com/v1/artists/" + artistId + "/related-artists";

    const relatedArtistsResponse = await fetch(url, {
        headers: {
            'Authorization': "Bearer " + access_token
        }
    });

    const relatedData = await relatedArtistsResponse.json();
    const artists = relatedData.artists;

    return artists;
}