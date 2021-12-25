var contentSpace = $(".search-panel");
var searchButton = $("#explore");
var countrySelect = $("#country-select");
var stateInput = $("#state-input");
var adjustResults = $("#adjust-results");

// What the user is allowed to search for
var searchType = [
    { identifier: "museum", apiParam: "entertainment.museum" },
    { identifier: "culture", apiParam: "entertainment.culture" },
    { identifier: "heritage", apiParam: "heritage" },
    { identifier: "manmade", apiParam: "man_made" },
    { identifier: "natural", apiParam: "natural" },
    { identifier: "nationalpark", apiParam: "national_park" },
    { identifier: "sights", apiParam: "tourism.sights" },
    { identifier: "historic", apiParam: "building.historic" }
];

// Object storing the info of the current search
var currentSearch = {
    city: null,
    state: null,
    country: null,
    activity: null
};
var searchResultArr = [];

// SAVE TO LOCAL STORAGE -> Pass info to itinerary
var savedPlaces = [];

// Get from localStorage
if ("saved-places" in localStorage) {
    savedPlaces = JSON.parse(localStorage.getItem("saved-places"));
}
if ("saved-location" in localStorage) {
    currentSearch = JSON.parse(localStorage.getItem("saved-location"));
}

// Gets the information from the paramaters submitted
function getSearchInfo() {
    // Grab the paramater string
    var queryString = document.location.search;

    if (queryString) {
        var querySplit = queryString.split(/[\s=&]+/); // Split query by = and &
        var citySearch = querySplit[1];
        if (citySearch == "state" || citySearch == "country" || citySearch == "type" || querySplit[querySplit.length - 1] == "undefined") {
            // If there is no city in the search, or search type, display search error message
            noSearchResults();
        }
        else {
            citySearch = citySearch.replace("%20", " "); // Replace %20 from url with a space
            var searchType = querySplit[querySplit.length - 1]; // Search type is last object
            var stateSearch = null; // Default is null because not required
            var countrySearch = null; // Default is null because not required
            if (querySplit.length == 6) { // If 6, there is a city, state OR country, and type
                if (querySplit[2].includes("state")) { // If state was searched
                    stateSearch = querySplit[3];
                } else { // If country was searched
                    countrySearch = querySplit[3];
                }
            } else if (querySplit.length == 8) { // If 8, everything was looked up
                stateSearch = querySplit[3];
                countrySearch = querySplit[5];
            }
            // Search the place using this information
            currentSearch.city = citySearch;
            currentSearch.activity = searchType;
            currentSearch.state = stateSearch;
            currentSearch.country = countrySearch;
            
            latLon(); // Find the latitude and longitude of searched place
        }
        
    } else {
        // If no parameters, then display that this is not a valid search
        noSearchResults();
    }
}
getSearchInfo(); // Get parameters on load

// If there are no search results
function noSearchResults() {
    var noSearch = $("<h2>") // Title
        .addClass("error-message")
        .text("This is not a search.");
    var errorMessage = $("<h3>") // Message
        .addClass("error-message")
        .text("Please make sure you are searching for at least a city and a point of interest type.");
    var noSearchLink = $("<p>") // Link to return home to make a new search
        .addClass("error-message")
        .html("<button onclick=\"window.location.href='index.html';\">Return to main page</button>")
    contentSpace // Append to page
        .append(noSearch)
        .append(errorMessage)
        .append(noSearchLink);
}

// Save location info to localStorage
function saveLocationInfo() {
    localStorage.setItem("saved-location", JSON.stringify(currentSearch));
}

// Search for the latitude and longitude of the submitted location
function latLon() {
    var searchTerm = "city=" + currentSearch.city; // Search term includes city
    if (currentSearch.state) { // If search included state, add state to lat/lon search
        searchTerm += ";state=" + currentSearch.state;
    }
    if (currentSearch.country) { // If search included country, add country to lat/lon search
        searchTerm += ";country=" + currentSearch.country;
    }

    var geocodeURL = "https://geocode.search.hereapi.com/v1/geocode?qq=" + searchTerm + "&apiKey=A_tZEkJx-nLOHsdriahgdmTRUsChHb6iC9uARM11Nb8";

    // Run fetch
    fetch(geocodeURL)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            // If API finds a latitude and longitude, use it for search
            searchResults(data.items[0].position.lat, data.items[0].position.lng);
        })
        .catch(function(error){
            // If no latitude / longitude, display no search error message
            noSearchResults();
        });
}

// Receive search results for locations
function searchResults(lat, lon) {
    // Find the API's search term for selected activity from searchType array
    for (var i = 0; i < searchType.length; i++) {
        if (searchType[i].identifier == currentSearch.activity){
            var activity = searchType[i].apiParam;
            break;
        }
    }
    
    var placesURL = "https://api.geoapify.com/v2/places?categories=" + activity + "&filter=circle:" + lon + "," + lat + ",5000&limit=40&apiKey=5f64f49cb696477d8dcdf83ec8fc94f2";

    // Default number of search results is 0
    var numberOfResults = 0;

    // Keep list of latin letters
    var latinLetters = "abcdefghijklnopqrstuvwxyz";
    latinLetters = latinLetters.split("");

    // Run fetch
    fetch(placesURL)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            // Loop through data
            for (var i = 0; i < data.features.length; i++) {
                var dataItem = data.features[i].properties;
                // Create object for this place
                var placeObject = {
                    place: dataItem.address_line1,
                    address: dataItem.address_line2,
                    image: "",
                    description: "",
                    web: ""
                }
                // Check to see if this item is a duplicate result (the API sometimes returns duplicates)
                var duplicateItem;
                for (var j = 0; j < searchResultArr.length; j++) {
                    if (searchResultArr[j].place == placeObject.place) {
                        duplicateItem = true; // If two places have the exact same name, it is a duplicate
                        break;
                    } else {
                        duplicateItem = false; // Else, false
                    }
                }
                // Check to see if item does not contain any latin letters (entirely in different language)
                var latinChar;
                var placeLower = placeObject.place.toLowerCase();
                for (var j = 0; j < latinLetters.length; j++) {
                    if (placeLower.includes(latinLetters[j])){
                        latinChar = true; // It it contains at least one, good
                        break;
                    } else {
                        latinChar = false; // Else, no
                    }
                }
                if (!duplicateItem && latinChar) { // If duplicateItem is false and latinChar is true
                    numberOfResults++; // Increase result number
                    searchResultArr.push(placeObject); // Push to array
                }
            }
            
            // Update search information with state and country (in case user did not submit them)
            currentSearch.state = data.features[0].properties.state;
            currentSearch.country = data.features[0].properties.country;
            saveLocationInfo();

            // For each item in search result array
            for (var i = 0; i < searchResultArr.length; i++) {
                getDescription(i); // Pass it to get a description
            }
            showResultNumber(numberOfResults, currentSearch.city); // Display number of results on page
        })
        .catch(function(error){
            noSearchResults(); // If no result, display error message
        });
}

// Get place description, if one can be found
function getDescription(result) {
    var searchTerm; // Currently, this search is imperfect and could be edited in the future, but it is here to prevent wrong page information from showing on commonly named places (like a Mint Museum)
    if (searchResultArr[result].place.toLowerCase().includes(currentSearch.city.toLowerCase())) {
        searchTerm = searchResultArr[result].place;
    } else { // Currently only looks up places with the city name in title
        searchTerm = searchResultArr[result].place + " " + currentSearch.city;
    }
    var wikipediaURL = "https://en.wikipedia.org/api/rest_v1/page/summary/" + searchTerm;

    // Run fetch
    fetch(wikipediaURL)
        .then(function(response) {
            if (response.ok) { // If there is a Wikipedia page to get information from
                response.json().then(function(data) {
                    searchResultArr[result].description = data.extract; // Get description
                    var image = data.thumbnail; // If the location has a thumbnail
                    if (image && !image.source.toLowerCase().includes("logo")) { // If the thumbnail is NOT a logo graphic instead of a photograph (like with the case of the Dubai Frame)
                        searchResultArr[result].image = image.source;
                    } else {
                        searchResultArr[result].image = ""; // If no image, leave blank for now
                    }
                    getWebURL(result); // Continue and get a web url
                });
            } else { // Automatically go to next part if no Wikipedia page
                getWebURL(result);
            }
        });
}

// Find a website URL for the place because it's important to access more information about places when planning a trip
function getWebURL(result) {
    var searchURL = "https://api.qwant.com/v3/search/web?count=10&q=" + searchResultArr[result].place + "%20" + currentSearch.city + "&t=web&safesearch=1&locale=en_US&offset=0&device=desktop";

    // Run fetch
    fetch(searchURL)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            var website = data.data.result.items.mainline; // Sorten data path for websites array
            var webURL = "";
            for (var i = 0; i < website.length; i++) { // For each item in the array
                if (website[i].type = "web" && website[i].items) { // Only allow websites labeled "web"
                    for (var j = 0; j < website[i].items.length; j++) {
                        var websiteURL =  website[i].items[j].source; // Grab website
                        if (websiteURL) {
                            websiteURL = websiteURL.toLowerCase(); // Convert url to all lowercase
                            if (websiteURL.includes("http") && !websiteURL.includes("wikipedia") && !websiteURL.includes("tripadvisor") && !websiteURL.includes("bing") && !websiteURL.includes("youtube") && !websiteURL.includes("google") && !websiteURL.includes("yahoo") && !websiteURL.includes("hotel") && !websiteURL.includes("photo") && !websiteURL.includes("map") && !website[i].items[j].media) { // If the website url does not include any of those terms and is not media, save url to search results
                                searchResultArr[result].web = websiteURL;
                                break;
                            }
                        }
                    }
                }
                if (webURL != "") { // If webURL is not "", continue and break from loop
                    displaySearch(result);
                    break;
                }
            }
            if (webURL == "") { // If we went through all that and have no url, continue anyway with nothing logged
                displaySearch(result);
            }
        });
}

// Display the search results
function displaySearch(result) {
    if (searchResultArr[result].place) {  // Only run this if we have a place name
        var urlPhrase = searchResultArr[result].place; // Set url phrase to place name
        if (searchResultArr[result].place.includes("&")) { // If place name includes "&" because & is a special character in search parameters
            urlPhrase = searchResultArr[result].place.replace("&", "and"); // Replace "&" with "and"
        }
        var imageURL = "https://api.qwant.com/v3/search/images?count=10&q=" + urlPhrase + "%20" + currentSearch.city + "&t=images&safesearch=1&locale=en_US&offset=0&device=desktop";

        // Run fetch
        fetch(imageURL)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                var imageThumb = "";
                if (searchResultArr[result].image == "") { // Run only if we did not get an image from Wikipedia
                    if (data.data.result.items) {
                        // This allows for multiple images to be an option if the first one does not work
                        for (var i = 0; i < data.data.result.items.length; i++) {
                            imageThumb = data.data.result.items[i].thumbnail;
                            if (data.data.result.items[0].thumbnail) {
                                break;
                            }
                        }
                        
                    }
                } else {
                    imageThumb = searchResultArr[result].image; // If we did get Wikipedia image, use that
                }
                
                // DISPLAY SEARCH RESULT ON PAGE
                var searchResult = $("<div>")
                    .addClass("search-result grid-x text-left");
                var resultImageDiv = $("<div>")
                    .addClass("search-image cell small-12 medium-4 large-3")
                    .css("background-image", "url('" + imageThumb + "')");
                var resultText = $("<div>")
                    .addClass("search-text cell small-12 medium-8 large-9");
                var resultTitle = $("<h2>")
                    .text(searchResultArr[result].place);
                var addressEl = $("<p>")
                    .addClass("h6 address")
                    .text(searchResultArr[result].address);

                resultText
                    .append(resultTitle)
                    .append(addressEl);
                    
                if (searchResultArr[result].web) { // If there is a website url, add the link
                    var webEl = $("<p>")
                        .addClass("h6");
                    var webLink = $("<a>")
                        .attr("href", searchResultArr[result].web)
                        .attr("target", "_blank")
                        .text("Visit the website");
                    webEl.append(webLink);
                    resultText.append(webEl);
                }
                if (searchResultArr[result].description) { // If there is a description, add the link
                    var descriptionEl = $("<p>")
                        .addClass("h6")
                        .text(searchResultArr[result].description);
                    resultText.append(descriptionEl);
                }

                // Button to add/remove from itinerary
                var buttonText = "+ Add to itinerary"; // Default add text
                for (var i = 0; i < savedPlaces.length; i++) {
                    if (savedPlaces[i].place == searchResultArr[result].place) {
                        buttonText = "- Remove from itinerary";  // If place is saved in localStorage, display remove text
                        break;
                    }
                }
                var dataPlaceName = searchResultArr[result].place.replace(/ /g, "-").toLowerCase();
                dataPlaceName = dataPlaceName.replace("'", ""); // Data place name, all lowercase, and replace spaces with -
                var addButton = $("<button>") // Create button
                    .text(buttonText)
                    .addClass("add-button")
                    .attr("data-place", dataPlaceName)
                    .attr("onClick", "toItinerary(\"" + searchResultArr[result].place + "\", \"" + searchResultArr[result].web + "\", \"" + dataPlaceName + "\")");
                resultText.append(addButton);

                // Append search results to page
                searchResult
                    .append(resultImageDiv)
                    .append(resultText);
                contentSpace.append(searchResult);

                getHeight(); // Get height for the image, so it can show up
            });
    }
}

function getHeight() { // Match height to a dynamic width
    $(".search-image").height($(".search-image").width());
}

// Function that runs on Add/Remove button click
function toItinerary(placeName, webURL, dataId) {
    var placeObject = { // Object to push to array
        place: placeName,
        web: webURL,
        time: null,
        cost: null
    }
    if ($("button[data-place='" + dataId + "'").text().includes("Remove")) { // If the item is already added to the itinerary
        for (var i = 0; i < savedPlaces.length; i++) {
            if (savedPlaces[i].place == placeName) {
                savedPlaces.splice(i, 1); // Remove from array
            }
        }
        $("button[data-place='" + dataId + "'").text("+ Add to itinerary"); // Switch text back to "Add"
    } else { // If the item is not yet added to the itinerary
        savedPlaces.push(placeObject); // Push this to the aray
        $("button[data-place='" + dataId + "'").text("- Remove from itinerary"); // Switch text to "Remove"
    }
    localStorage.setItem("saved-places", JSON.stringify(savedPlaces)); // Save to localStorage
}

// Show how many search results come up
function showResultNumber(number, city) {
    var displayLocation = city; // Display location shows city
    if (city.includes("%20")) {
        displayLocation = city.replace("%20", " "); // Make sure all %20 is replaced with a space
    }
    if (currentSearch.state) { // If there is a state, add state
        displayLocation += ", " + currentSearch.state;
    }
    if (currentSearch.country) { // If there is a country, add country
        displayLocation += ", " + currentSearch.country;
    }
    var searchResultNum = $("<h3>")
        .addClass("text-left")
        .text("Showing " + number + " results for " + displayLocation);
    contentSpace.append(searchResultNum); // Display on page
}

// Display a list of countries to select from a dropdown for search
var availableStates = [];
var countryIndex = null;
function listCountries() {
    var countryListAPI = "https://countriesnow.space/api/v0.1/countries/states";

    // Run fetch
    fetch(countryListAPI)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            // Add list of countries to drop down
            for (var i = 0; i < data.data.length; i++) {
                var countryName = data.data[i].name;
                var option = $("<option>")
                    .attr("value", countryName)
                    .text(countryName);
                countrySelect.append(option);
            }
            // Once country is selected , apply autocomplete to the state input
            $(countrySelect).blur(function(){
                // Get selected country name and index
                var selectedCountry = $("select[name='country']").val();
                for (var i = 0; i < data.data.length; i++) {
                    if (data.data[i].name == selectedCountry) {
                        countryIndex = i;
                    }
                }
                // Loop through states and add them to the autocomplete array
                if (selectedCountry != "blank") {
                    for (var i = 0; i < data.data[countryIndex].states.length; i++){
                        availableStates.push(data.data[countryIndex].states[i].name);
                    }
                    // Functions to run autocomplete
                    var selectIem = function(event, ui) {
                        stateInput.val(ui.item.value);
                        return false;
                    }
                    stateInput.autocomplete({ // Autocomplete options pull from availableStates
                        source: availableStates,
                        select: selectIem
                    });
                }
                availableStates = []; // Reset available states, so a country change doesn't stack up
            });
        });
}
listCountries(); // Display on default

// Type of location radio selection
$("input[name='search-type']").on("click", function(){
    var searchType = $("input[name='search-type']:checked").attr("id");
    return searchType;
});


// SEARCH BUTTON
if (searchButton.length) { // If search button is on page
    searchButton.on("click", function(event) {
        // Prevent default refresh
        event.preventDefault();

        // Get values
        var selectedCity = $("input[name='city']").val(); // City
        var searchType = $("input[name='search-type']:checked").attr("id"); // Radio selection

        // City needs each word to begin with a capital letter (i.e. "san francisco" -> "San Francisco")
        selectedCity = selectedCity.split(" ").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");

        currentSearch.city = selectedCity;
        currentSearch.activity = searchType;

        var selectedState = $("input[name='state']").val(); // If a state is searched up
        if (selectedState) {
            selectedState = selectedState.split(" ").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" "); // Make sure each word begins with capital (i.e. "new jersey" -> "New Jersey")
            currentSearch.state = selectedState;
            selectedCity += "&state=" + selectedState; // Add to search query
        }
        var selectedCountry = $("select[name='country']").val(); // If a country is searched up
        if (selectedCountry && selectedCountry != "blank") {
            currentSearch.country = selectedCountry;
            selectedCity += "&country=" + selectedCountry; // Add to search query
        }

        // Go to results page
        window.location.href = "./results.html?city=" + selectedCity + "&type=" + searchType;
    });
}
// If result adjustment is on page
if (adjustResults.length) {
    $("input[name='search-type'][id='" + document.location.search.split("&type=")[1] + "'").prop("checked", true); // Select the clicked on one
    $("input[name='search-type']").on("click", function(){
        var searchType = $("input[name='search-type']:checked").attr("id");
        var searchURL = window.location.href; // Get url of page (has query selection)
        searchURL = searchURL.split("&type=")[0]; // Remove current url type
        window.location.href = searchURL + "&type=" + searchType; // Add new search type to url and go
    });
}