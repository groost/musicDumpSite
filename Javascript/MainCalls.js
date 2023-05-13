var access_token;
import { processNames } from "./SongCalls.js";

async function getAccessToken() {
    const client_id = "38dea9d3a01744aea205b2d60761f2f9";
    const client_secret = "55e266eea7494b12a279e1e1586adec9";
    // const client_id = 'e1518d54f8ab43f9bdc00c12b841aede';
    // const client_secret = 'a4dcd6e9cbfa4fde9737ff74011a7f1b';

    const url = "https://accounts.spotify.com/api/token";

    const accessTokenResponse = await fetch(url, {
        method: "POST",
        headers: {
            'Content-Type'  : 'application/x-www-form-urlencoded',
            'Authorization' : "Basic " + btoa(client_id + ":" + client_secret)
        },
        body: 'grant_type=client_credentials'
    });

    const accessTokenData = await accessTokenResponse.json();
    return access_token = accessTokenData.access_token;   
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function exportToCSV(filename, data) {
    var csv = "songName,artistName,genreName,acousticness,danceability,energy,instrumentalness,liveness,loudness,speechiness,tempo\n";
    
    for(var i = 0; i < data.length; i++) {
        for(var j = 0; j < data[i].length; j++) {
            if((typeof data[i][j] === "string") && data[i][j].toString().indexOf(",") != -1) 
                data[i][j] = data[i][j].toString().replace(/[,]/g, "");
            if((typeof data[i][j] === "string"))
                data[i][j] = processNames(data[i][j]);
            
            if(j > 0) 
                csv += ",";
            
            csv += data[i][j];
        }

        csv += "\n";
    }

    console.log(csv);

    var hiddenElement = document.createElement('a');  
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);  
    hiddenElement.target = '_blank';  
    
    //provide the name for the CSV file to be downloaded  
    hiddenElement.download = filename;  
    hiddenElement.click();
}

// async function authenticate() {
//     const client_id = "38dea9d3a01744aea205b2d60761f2f9";

//     const SCOPES = ['user-read-private', 'user-read-email']; // Add any additional scopes your app requires
    
//     const params = new URLSearchParams(window.location.search);
//     const code = params.get("code");

//     if (!code) {
//         redirectToAuthCodeFlow(client_id);
//     } else {
//         const accessToken = await getAccessToken(clientid, code);
//         const profile = await fetchProfile(accessToken);
//         populateUI(profile);
//     }
// }

// export async function getAccessToken(clientId, code){
//     const verifier = localStorage.getItem("verifier");

//     const params = new URLSearchParams();
//     params.append("client_id", clientId);
//     params.append("grant_type", "authorization_code");
//     params.append("code", code);
//     params.append("redirect_uri", "http://localhost:5173/callback");
//     params.append("code_verifier", verifier!);

//     const result = await fetch("https://accounts.spotify.com/api/token", {
//         method: "POST",
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         body: params
//     });

//     const { access_token } = await result.json();
//     return access_token;
// }

// export async function redirectToAuthCodeFlow(clientId) {
//     const verifier = generateCodeVerifier(128);
//     const challenge = await generateCodeChallenge(verifier);

//     localStorage.setItem("verifier", verifier);

//     const params = new URLSearchParams();
//     params.append("client_id", clientId);
//     params.append("response_type", "code");
//     params.append("redirect_uri", "http://localhost:5173/callback");
//     params.append("scope", "user-read-private user-read-email");
//     params.append("code_challenge_method", "S256");
//     params.append("code_challenge", challenge);

//     document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
// }

// function generateCodeVerifier(length) {
//     let text = '';
//     let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

//     for (let i = 0; i < length; i++) {
//         text += possible.charAt(Math.floor(Math.random() * possible.length));
//     }
//     return text;
// }

// async function generateCodeChallenge(codeVerifier) {
//     const data = new TextEncoder().encode(codeVerifier);
//     const digest = await window.crypto.subtle.digest('SHA-256', data);
//     return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
//         .replace(/\+/g, '-')
//         .replace(/\//g, '_')
//         .replace(/=+$/, '');
// }

export {getAccessToken, exportToCSV, sleep};