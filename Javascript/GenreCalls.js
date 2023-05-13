var access_token;
import {getAccessToken} from './MainCalls.js';


export async function findArtistGenre(artistName) {
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
        const artistGenre = artistData.artists.items[0].genres[0];
        return [artistGenre, artistData['artists']['items'][0]['images'][0]['url']];
    } catch(error) {
        return "";
    }
}

