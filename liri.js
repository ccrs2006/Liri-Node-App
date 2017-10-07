//Keys For both twitter and spotify-----------------------------------------------
var keys = require('./keys.js');

// Interacts with file system-----------------------------------------------------
var fs = require("fs");

//Helps have call backs on the terminal-------------------------------------------
var inquirer = require('inquirer');

//colors fonts on the results we want highlighted----------------------------------
var colors = require("colors");

//for twitter----------------------------------------------------------------------
var params = {screen_name: 'castiblancoRS'};
var twitter = require("twitter");
var twitterClient = new twitter(keys.twitterKeys);

//for OMDB-------------------------------------------------------------------------
var request = require("request");

//for spotify----------------------------------------------------------------------
var Spotify = require('node-spotify-api');
var spotifyClient = new Spotify(keys.spotifyKeys);

//==================================================================================

mainScreen();

//Main options----------------------------------------------------
function mainScreen() {
    inquirer.prompt([
        {
            type: "list",
            message: "*****************\nWELCOME TO LIRI -> PLEASE MAKE A SELECTION\n? *******************\n",
            choices: ["1-Twitter", "2-Spotify", "3-OMDB", "4-Do something random", "5-Quit"],
            name: "mainScreenChoice"
        }
    ]).then(function(response) { 
        if (response.mainScreenChoice === '1-Twitter') {
            accessTwitter();
        }
        else if (response.mainScreenChoice === '2-Spotify') {
            accessSpotify();
        }
        else if (response.mainScreenChoice === '3-OMDB') {
            getOMDB();
        }
        else if (response.mainScreenChoice === '4-Do something random') {
            doWhatTheRandomFileSays();
        }
        else if (response.mainScreenChoice === '5-Quit') {
            quit();
        }
        else {
            console.log("Something went wrong!")
        }
    })
}

//twitter ----------------------------------------------------
function accessTwitter() {
    twitterClient.get('statuses/user_timeline', params, function(error, tweetArray, response) {
        if (!error) {
            console.log("These are your most recent tweets:\n");
            var tweetCount = 1;
            tweetArray.forEach(function (tweet){
                if (tweetCount > 20) {
                }
                console.log(` ${tweetCount} ${tweet.created_at} ${tweet.text}`);
                tweetCount++;
            });
        }
        afterTwitterPrompt();
    });
}

function createTweet() {
    // console.log("Selected create new Tweet.\n");
    inquirer.prompt([
        {
            type: "input",
            message: "Tweet something: ",
            name: "tweetText"
        }
    ]).then(function(response){
        if (response.tweetText === "") {
            console.log("No tweet added");
            accessTwitter();
            return;
        }
        twitterClient.post('statuses/update', {status: response.tweetText},  function(error, tweet, response) {
            if(error) throw error;
            console.log("New Tweet created: '" + response.tweetText + "'\n")
            accessTwitter();
        });
    });
}

function afterTwitterPrompt() {
    inquirer.prompt([
        {
            type: "list",
            message: "******************\nWhat do you want to do next?\n********************\n",
            choices: ["1-Main Menu", "2-New Tweet", "3-Quit"],
            name: "mainScreenChoice"
        }
    ]).then(function(response) {
        if (response.mainScreenChoice === '1-Main Menu') {
            mainScreen();
        }
        else if (response.mainScreenChoice === '2-New Tweet') {
            createTweet();
        }
        else if (response.mainScreenChoice === '3-Quit') {
            quit();
        }
        else {
            console.log("Something went wrong with Twitter")
        }
    });
}

//spotify ----------------------------------------------------
function accessSpotify() {
    inquirer.prompt([
        {
            type: "input",
            message: "♫♫♫♫-- What song??? --♫♫♫",
            name: "spotifyRequest"
        },
        {
            type: "input",
            message: "♫♫♫-- How many results do you want to see??? --♫♫♫",
            name: "numberOfResults"
        }
    ]).then(function(response){
        if (response.spotifyRequest === ""){
            console.log("No song was added, please enter the name of a song.")
        }
        //     response.spotifyRequest = "All That She Wants"
        //     console.log('Since you gave no search term, you get "All That She Wants" by Ace of Base - enjoy!');
        // }
        if (response.numberOfResults === "") {
            console.log("Please enter the amount of results you want as well")
        }
        console.log("\nResults for: (" + response.spotifyRequest + ") with " + response.numberOfResults + " results");
        searchSpotify(response.spotifyRequest, response.numberOfResults);
    });
}

function searchSpotify(thisSong, numberOfResults) {
    spotifyClient.search({ type: 'track', query: thisSong }, function(err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        var songCount = 1;
        data.tracks.items.forEach(function(songListing){
            if (songCount > numberOfResults) {
                return false;
            }
            let artist = songListing.album.artists[0].name;
            let song = songListing.name;
            let songUrl = songListing.album.artists[0].external_urls.spotify;
            let album = songListing.album.name;
            console.log("\n***********************************************************************")
            console.log(songCount + "  Song: " + song);
            console.log("   Artist: " + artist);
            console.log("   Album: " + album);
            console.log("   Song URL: " + songUrl);
            songCount++;
            console.log("***********************************************************************")
        });
    console.log("\nThese are the results we found from Spotify.\n\n");

    mainScreen();
    });
}

//This will access the movies entered----------------------------------------------------
function getOMDB() {
    inquirer.prompt([
        {
            type: "input",
            message: "Name a movie",
            name: "movieRequest"
        }
    ]).then(function(response){

        if (response.movieRequest === ""){
            console.log("Please enter a movie name.")
            console.log("Make sure the name of the movie is correct.")
            mainScreen();
        }
        
        console.log("\nMovie result for: (" + response.movieRequest + ")\n")
        request("http://www.omdbapi.com/?t=" + response.movieRequest + "&y=&plot=short&apikey=40e9cece", function(error, response, body) {
        
          if (!error && response.statusCode === 200) {
        
            console.log("Movie title: " + JSON.parse(body).Title); 
            console.log("Year released: " + JSON.parse(body).Year);
            console.log("IMDB rating: " + JSON.parse(body).imdbRating);
            console.log("Actors: " + JSON.parse(body).Actors);
            console.log("Rotten Tomatoes rating: " + JSON.parse(body).Ratings[0].Value);
            console.log("Language of movie: " + JSON.parse(body).Language);
			console.log("Plot: " + JSON.parse(body).Plot);
          }
          console.log("\nThese are the results we found from OMDA.com\n\n")
          mainScreen();
        });
    });
}

function doWhatTheRandomFileSays() {
    console.log("\nWant something random -->> go to https://google.com and type (Do a Barrel Roll)\n");
    console.log("Or just wait to see what happens here...\n")
    fs.readFile("random.txt", "utf8", function(error, data) {
        if (error) {
            return console.log(error);
        }
        // console.log(data);
        var dataArray = data.split(",");
        
        if (dataArray[0] === "searchSpotify") {
            searchSpotify(dataArray[1], dataArray[2]);
        }
    });
}

//This will exit the liri app----------------------------------------------------
function quit() {
    console.log("\nHasta la vista baby!!!");
    console.log(".")
    console.log("..")
    console.log("...")
    console.log("....")
    console.log(".....Exiting Liri now...")
}



