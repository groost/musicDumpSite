var access_token;
var checkExp = /[(]/;

import { getAccessToken, sleep } from './MainCalls.js';
import { getArtistsAlbums, getAlbumIDs } from './AlbumCalls.js';
import { findArtistGenre } from './GenreCalls.js';
import { findArtistID } from './ArtistCalls.js';

export async function searchSongs(artistId) {
    if(!access_token || access_token.length == 0)
        access_token = await getAccessToken();
    
        // console.log(access_token);
    if(artistId.length == 0) return [];

    var url = "https://api.spotify.com/v1/artists/" + artistId + "/top-tracks?market=US";

    const tracksResponse = await fetch(url, {
        headers: {
            'Authorization' :   'Bearer ' + access_token
        }
    });

    const artistData = await tracksResponse.json();
    const tracks = artistData.tracks;
    
    return tracks;
}

export function processNames(name) {
    var newName = name;
    while(newName.indexOf("|") != -1) {
        newName = newName.replace(/[|]/, "");
    }
    while(newName.indexOf("'") != -1) {
        newName = newName.replace(/[\']/, "");
    }
    while(newName.indexOf("\"") != -1) {
        newName = newName.replace(/[\"]/, "");
    }
    while(newName.indexOf(",") != -1) {
        newName = newName.replace(/[,]/, "");
    }
    if(newName.indexOf("(") != -1) {
        newName = newName.substring(0, newName.search(/[(]/));
    }
    while(newName.indexOf("\\") != -1) {
        newName = newName.replace(/[\\]/, "");
    }
    while(newName.indexOf("/") != -1) {
        newName = newName.replace(/[/]/, "");
    }
    while(newName.indexOf("#") != -1) {
        newName = newName.replace(/[#]/, "");
    }
    while(newName.indexOf("-") != -1) {
        newName = newName.replace(/[-]/, "");
    }
    while(newName.indexOf("%") != -1) {
        newName = newName.replace(/[%]/, "");
    }
    while(newName.indexOf(":") != -1) {
        newName = newName.replace(/[:]/, "");
    }
    while(newName.indexOf(">") != -1) {
        newName = newName.replace(/[>]/, "");
    }

    return newName;
}

export async function getSongID(songName, artistName) {
    if(!access_token || access_token.length == 0)
        access_token = await getAccessToken();

    console.log(songName + ", " + artistName);

    var song_name = processNames(songName);
    var artist_name = processNames(artistName);
    var url = 'https://api.spotify.com/v1/search?q=track:' + song_name + '&artist:' + artist_name + '&type=track';

    try {
        const songIdResponse = await fetch(url, {
            headers: {
                'Authorization': "Bearer " + access_token
            }
        });

        const songIdData = await songIdResponse.json();
        const features = songIdData['tracks'];
        if(features.length === 0) 
            return "";
        return features['items'][0].id;
    } catch(error) {
        console.log(songName + " - " + artistName + " = not found.");
        return "";
    }
}

export async function getSongDetails(songId, songName, artistName, genreName) {
    if(!songId || songId.length == 0) {
        return "";
    }

    if(!access_token || access_token.length == 0)
        access_token = await getAccessToken();

    var url = 'https://api.spotify.com/v1/audio-features/' + songId;

    const getSongDetailsResponse = await fetch(url, {
        headers: {
            'Authorization': "Bearer " + access_token
        }
    });

    const getSongDetailsData = await getSongDetailsResponse.json();
    await addSongDetails(songName, artistName, genreName, getSongDetailsData);
    return getSongDetailsData;
}

export async function getMultipleSongDetails(songIDs, songNames, artistNames, genreNames) {
    if(!access_token || access_token.length == 0)
        access_token = await getAccessToken();  

    // console.log(songIDs.match(/[,]/g));
    var url = 'https://api.spotify.com/v1/audio-features?ids=' + songIDs;

    const getSongDetailsResponse = await fetch(url, {
        headers: {
            'Authorization': "Bearer " + access_token
        }
    });
    
    const getSongDetailsData = await getSongDetailsResponse.json();

    return getSongDetailsData['audio_features'];
}

export async function getSongRecs(songNames, artistNames, genreNames) {
    if(!access_token || access_token.length == 0)
        access_token = await getAccessToken();

    var artistIDs = "";
    if(artistNames.length > 0) {
        for(var a of artistNames) {
            await sleep(500);
            
            artistIDs += ((await findArtistID(a)) + ",");
        }
        
        artistIDs = artistIDs.substring(0, artistIDs.length-1);
    }

    await sleep(100);
    
    var songIDs = "";
    if(songNames.length > 0) {
        for(var i = 0; i < songNames.length; i++) {
            await sleep(500);
            var songID = await getSongID(songNames[i][0], songNames[i][1]);
            if(songID.length === 0)
                continue;

            songIDs += songID + ",";
        }
        
        songIDs = songIDs.substring(0, songIDs.length-1);
    }
        
        if(genreNames.length > 0) {
        genreNames = genreNames.substring(0, genreNames.length-1);
    }


    var url = "https://api.spotify.com/v1/recommendations?limit=5&market=US" + (artistIDs.length > 0 ? "&seed_artists=" + artistIDs : "") + (genreNames.length > 0 ? "&seed_genres=" + genreNames : "") + (songIDs.length > 0 ? "&seed_tracks=" + songIDs : "");

    await sleep(500);

    const similarSongsResponse = await fetch(url, {
        headers: {
            'Authorization': "Bearer " + access_token
        }
    });

    return await similarSongsResponse.json();
}

export async function getUsersPlaylists(userID) {
    if(!access_token || access_token.length == 0)
        access_token = await getAccessToken();

    var url = "https://api.spotify.com/v1/users/" + userID + "/playlists";

    const playlistResponse = await fetch(url, {
        headers: {
            'Authorization': "Bearer " + access_token
        }
    });

    const playlistData = await playlistResponse.json();
    console.log(playlistData);
    var playlistIDs = [];
    var i;
    for(i = 0; i < playlistData['items'].length; i++) {
        playlistIDs.push(playlistData['items'][i]['id']);
    }

    return playlistIDs;
}

export async function getPlaylist(playlistID) {
    if(!access_token || access_token.length == 0)
        access_token = await getAccessToken();
        
    var url = 'https://api.spotify.com/v1/playlists/' + playlistID;

    const playlistResponse = await fetch(url, {
        headers: {
            'Authorization': "Bearer " + access_token
        }
    });

    var playlistData = await playlistResponse.json();
    playlistData = playlistData['tracks']['items'];

    var i;
    var albumIDs = [];
    var artistNames = [];
    console.log(playlistData);
    var albumURLs = [];
    for(i = 0; i < playlistData.length; i++) {
        var track = playlistData[i]['track'];
        if(artistNames.indexOf(track['artists'][0]['name']) != -1) {
            console.log("found artist already.")
            continue;
        }
        
        artistNames.push(track['artists'][0]['name']);
        
        albumURLs.push([track['name'], track['artists'][0]['name'], track['external_urls']['spotify'], track['album']['images'][0]['url']]);
        
        albumIDs.push(...getAlbumIDs(await getArtistsAlbums(track['artists'][0]['name'])));
    }

    await sleep(1000);
 
    return [albumURLs, albumIDs];
}

export async function getSimilarSongs(songName, artistName) {
    var song_name = processNames(songName);
    var artist_name = processNames(artistName);

    var songID = await getSongID(song_name, artist_name);

    await sleep(500);

    var artistGenre = await findArtistGenre(artist_name);

    await sleep(500);

    var songDetails = await getSongDetails(songID, song_name, artist_name, artistGenre);
    
    console.log(songID);
    console.log(artistGenre);
    console.log(songDetails);

    const similarSongsResponse = await fetch('PHP/dbSongs.php', {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: "methodName=searchSimilarSongs&songName=" + encodeURIComponent(song_name) + "&artistName=" + encodeURIComponent(artist_name) + "&genreName=" + encodeURIComponent(artistGenre[0]) + "&energy=" + encodeURIComponent(songDetails['energy']) + "&danceability=" + encodeURIComponent(songDetails['danceability'])
    });

    const similarSongsData = await similarSongsResponse.json();
    var arr = [];
    for(var a of similarSongsData) {
        var img = await findArtistGenre(a[1]);
        a.push(img[1]);
        arr.push(a);
    }

    return arr;
}

export async function getUserSongs() {
    if(!access_token || access_token.length == 0)
        access_token = await getAccessToken();

    var accessToken = await authenticate();

    var url = "https://api.spotify.com/v1/me/tracks";

    const getUserSongsResponse = await fetch(url, {
        headers: {
            'Authorization': "Bearer " + accessToken
        }
    });

    const getUserData = await getUserSongsResponse.json();

    return getUserData;
}

export async function searchSong(songName, artistName) {
    if(!access_token || access_token.length == 0)
        access_token = await getAccessToken();

    var song_name = processNames(songName);

    var url = "https://api.spotify.com/v1/search?q=Track:" + song_name + "&type=track";
    console.log(url);
    const searchSongResponse = await fetch(url, {
        headers: {
            'Authorization': "Bearer " + access_token
        }
    });
    
    if(!searchSongResponse) return "";

    return await searchSongResponse.json();
}
