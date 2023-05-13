var access_token;
import { getAccessToken } from './MainCalls.js';
import { findArtistGenre } from './GenreCalls.js';
import { getMultipleSongDetails, processNames } from './SongCalls.js';
console.log('imported.');

export async function getArtistsAlbums(artistName) {
    if(!access_token || access_token.length == 0)
        access_token = await getAccessToken();

    const searchRegExp = /\s/g;
    const replaceWith = '+';

    var result = artistName.replace(searchRegExp, replaceWith);
    result = processNames(artistName);

    var url = 'https://api.spotify.com/v1/search?q=artist:' + result + "&type=album";
    
    try {
        const albumIDResponse = await fetch(url, {
            headers: {
                'Authorization' : "Bearer " + access_token
            }
        });

        const albumIDResult = await albumIDResponse.json();
        
        return albumIDResult;
    } catch(error) {
        
    } 
    
    return [];
}

export function getAlbumIDs(albumData) {
    var resultArr = [];
    var albums = albumData['albums']['items'];
    for(var i = 0; i < albums.length; i++) {
        resultArr.push(albums[i]['id']);
    }

    return resultArr;
}

export async function getAlbumTracks(albumIDs) {
    if(!access_token || access_token.length == 0)
        access_token = await getAccessToken();

    const addAlbumResponse = await fetch("https://api.spotify.com/v1/albums?ids=" + albumIDs, {
        headers: {
            'Authorization' : "Bearer " + access_token
        }
    });

    return await addAlbumResponse.json();
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function addAlbums(albumIDs) {
    var addAlbumURL = "";
    var artistNames = [];
    var genreNames = "";
    var genreNamesArr = [];
    var songNames = [];
    var songIDs = "";
    var retData = [];
    
    for(i = 0; i < albumIDs.length; i++) {
        if(i > 0) addAlbumURL += ",";

        addAlbumURL += albumIDs[i];
    }

    var arr = [];
    if((addAlbumURL.split(",").length - 1) > 20) {
        var tempStr = "";
        for(i = 0; i < albumIDs.length; i++) {
            if(i % 20 == 19) {
                tempStr += albumIDs[i];
                arr.push(tempStr);
                tempStr = "";
            }
            else {
                tempStr += albumIDs[i] + ",";
            }
        }
    }
    else
        arr.push(addAlbumURL);

    console.log(arr);

    var cnt = 0;
    for(var a of arr) {
        await sleep(500);
        
        console.log("progress through albums: " + (1.0 * (cnt++) / arr.length * 100));

        if(a.length == 0)
            continue;

        const addAlbumData = await getAlbumTracks(a);
        console.log(addAlbumData);
        
        for(var i = 0; i < addAlbumData['albums'].length; i++) {
            console.log("Progress through tracks: " + (1.0 * i / addAlbumData['albums'].length * 100));
            if(!addAlbumData['albums'][i]) continue;
            var artistName = addAlbumData['albums'][i]['artists'][0]['name'];

            await sleep(500);

            var genreName = await findArtistGenre(artistName);
            
            for(var b of addAlbumData['albums'][i]['tracks']['items']) {
                songNames.push(b['name']);
                artistNames.push(artistName);
                genreNames+=genreName+",";
                genreNamesArr.push(genreName);
                
                if(songNames.length == 100) {
                    songIDs += b['id'];
                    
                    await sleep(500);
                    
                    var details = await getMultipleSongDetails(songIDs, songNames, artistNames, genreNames);
                    console.log(details);

                    for(var k = 0; k < details.length; k++) {
                        if(details[k] === null) continue;

                        var toAdd = [songNames[k], artistNames[k], genreNamesArr[k][0], details[k]['acousticness'], details[k]['danceability'], details[k]['energy'], details[k]['instrumentalness'], details[k]['liveness'], details[k]['loudness'], details[k]['speechiness'], details[k]['tempo']];

                        retData.push(toAdd);
                    }

                    songIDs = "";
                    songNames = [];
                    artistNames = [];
                    genreNames = [];
                } else 
                    songIDs += b['id'] + ",";
            }
        }

        if(songIDs.length > 0) {
            var details = await getMultipleSongDetails(songIDs.substring(0, songIDs.length - 1), songNames, artistNames, genreNames);
            console.log(details);

            for(var k = 0; k < details.length; k++) {
                if(details[k] === null) continue;

                var toAdd = [songNames[k], artistNames[k], genreNamesArr[k][0], details[k]['acousticness'], details[k]['danceability'], details[k]['energy'], details[k]['instrumentalness'], details[k]['liveness'], details[k]['loudness'], details[k]['speechiness'], details[k]['tempo']];
                        
                retData.push(toAdd);
            }
        }


    }   
    
    console.log("completed!");
    return retData;
}
