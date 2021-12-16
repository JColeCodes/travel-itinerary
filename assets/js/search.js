var contentSpace = $(".search-panel");
var searchButton = $(".explore");
var countrySelect = $("#country-select");
var stateInput = $("#state-input");

// Dummy Results for testing purposes
var dummyResults = [
    {
        place: "Winchester Mystery House",
        city: "San Jose",
        address: "Dummy Address, San Jose, CA, USA"
    }, 
    {
        place: "Safdarjung's Tomb",
        city: "New Delhi",
        address: "Dummy Address, New Delhi, Delhi, India"
    }, 
    {
        place: "Osaka Castle",
        city: "Osaka",
        address: "Dummy Address, Osaka, Japan"
    }, 
    {
        place: "Louvre Abu Dhabi",
        city: "Abu Dhabi",
        address: "Dummy Address, Abu Dhabi, UAE"
    },  
    {
        place: "Barangaroo Reserve",
        city: "Sydney",
        address: "Dummy Address, Sydney, NSW, Australia"
    }
];

// What the user is allowed to search for
var searchType = [
    {
        identifier: "museum",
        apiParam: "entertainment.museum"
    },
    {
        identifier: "culture",
        apiParam: "entertainment.culture"
    },
    {
        identifier: "heritage",
        apiParam: "heritage"
    },
    {
        identifier: "manmade",
        apiParam: "man_made"
    },
    {
        identifier: "natural",
        apiParam: "natural"
    },
    {
        identifier: "nationalpark",
        apiParam: "national_park"
    },
    {
        identifier: "sights",
        apiParam: "tourism.sights"
    },
    {
        identifier: "historic",
        apiParam: "building.historic"
    }
];

// Object storing the info of the current search
var currentSearch = {
    city: null,
    activity: null
};
var searchResultArr = [];

// SAVE TO LOCAL STORAGE -> Pass info to itinerary
var savedPlaces = [];

// Gets the information from the paramaters submitted
function getSearchInfo() {
    // Grab the paramater string
    var queryString = document.location.search;

    if (queryString) {
        var citySearch = queryString.split("=")[1];
        citySearch = citySearch.split("&")[0];
        citySearch.replace("%20", " ");
        var searchType = queryString.split("=")[2];
        // Search the place using this information
        currentSearch.city = citySearch;
        currentSearch.activity = searchType;
        latLon();
    } else {
        // If no parameters, then display that this is not a valid search
        noSearchResults();
    }
}
getSearchInfo(); // Get parameters on load

function noSearchResults() {
    console.log("No search");
    var noSearch = $("<h2>")
        .text("This is not a search.");
    contentSpace.append(noSearch);
}

// Search for the latitude and longitude of the submitted location
function latLon() {
    var geocodeURL = "https://geocode.search.hereapi.com/v1/geocode?q=" + currentSearch.city + "&apiKey=A_tZEkJx-nLOHsdriahgdmTRUsChHb6iC9uARM11Nb8";

    // Run fetch
    fetch(geocodeURL)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log(data.items[0].position.lat);
            console.log(data.items[0].position.lng);
            searchResults(data.items[0].position.lat, data.items[0].position.lng);
        })
        .catch(function(error){
            noSearchResults();
        });
}
//latLon("Istanbul", "museum");

// Receive search results for locations
function searchResults(lat, lon) {
    for (var i = 0; i < searchType.length; i++) {
        if (searchType[i].identifier == currentSearch.activity){
            var activity = searchType[i].apiParam;
            break;
        }
    }
    // TO-DO: Get search to look up searchType's apiParam by the input activity identifier
    var placesURL = "https://api.geoapify.com/v2/places?categories=" + activity + "&filter=circle:" + lon + "," + lat + ",5000&limit=20&apiKey=5f64f49cb696477d8dcdf83ec8fc94f2";

    var numberOfResults = 0;

    // Run fetch
    fetch(placesURL)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log(placesURL);
            console.log(data);
            // TO-DO: Add each place to the searchResults array as an object
            /* Object Structure:
            { place: dataItem.address_line1,
              address: address,
              image: url,
              description: string - empty or filled,
              web: url } */
            for (var i = 0; i < data.features.length; i++) {
                var dataItem = data.features[i].properties;
                console.log(dataItem.name);
                //var address = dataItem.address_line2;
                numberOfResults++;

                var placeObject = {
                    place: dataItem.address_line1,
                    address: dataItem.address_line2,
                    image: "",
                    description: "",
                    web: ""
                }
                searchResultArr.push(placeObject);
                // Instead of passing all this stufd through the functions, just save to object array
                //getDescription(dataItem.address_line1, city, address);
            }
            for (var i = 0; i < searchResultArr.length; i++) {
                getDescription(i);
                console.log(searchResultArr);
            }
            showResultNumber(numberOfResults, currentSearch.city);
        });
}
/*searchResultArr = dummyResults;
for (var i = 0; i < searchResultArr.length; i++) {
    getDescription(i);
}*/

// Get place description, if one can be found
function getDescription(result) {
    var wikipediaURL = "https://en.wikipedia.org/api/rest_v1/page/summary/" + searchResultArr[result].place;

    // Run fetch
    fetch(wikipediaURL)
        .then(function(response) {
            console.log(response.status);
            if (response.ok) {
                response.json().then(function(data) {
                    console.log(data);
                    searchResultArr[result].description = data.extract;
                    var image = data.originalimage;
                    if (image && !image.source.toLowerCase().includes("logo")) {
                        searchResultArr[result].image = image.source;
                    } else {
                        searchResultArr[result].image = "";
                    }
                    //console.log(description);
                    //console.log(image);
                    getWebURL(result);
                });
            } else {
                getWebURL(result);
            }
        });
}

// Find a website URL for the place because it's important to access more information about places when planning a trip
function getWebURL(result) {
    var searchURL = "https://api.qwant.com/v3/search/web?count=10&q=" + searchResultArr[result].place + "%20" + currentSearch.city + "&t=web&safesearch=1&locale=en_US&offset=0&device=desktop";

    fetch(searchURL)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log(data);
            var website = data.data.result.items.mainline;
            var webURL = "";
            for (var i = 0; i < website.length; i++) {
                if (website[i].type = "web") {
                    for (var n = 0; n < website[i].items.length; n++) {
                        var websiteURL =  website[i].items[n].url;
                        if (websiteURL) {
                            if (!websiteURL.includes("wikipedia") && !websiteURL.includes("tripadvisor") && !websiteURL.includes("bing") && !websiteURL.includes("hotel") && !website[i].items[n].media) {
                                searchResultArr[result].web = websiteURL;
                                break;
                            }
                        }
                        
                    }
                }
                if (webURL != "") {
                    displaySearch(result);
                    break;
                }
            }
            if (webURL == "") {
                displaySearch(result);
            }
        });
}
/*for (var i = 0; i < dummyResults.length; i++) {
    testSearch(dummyResults[i].title, dummyResults[i].city, dummyResults[i].address);
}*/

// Display the search results
function displaySearch(result) {
    if (searchResultArr[result].place) { 
        var urlPhrase = searchResultArr[result].place;
    if (searchResultArr[result].place.includes("&")) {
        var urlPhrase = searchResultArr[result].place.replace("&", "and");
    }
    var imageURL = "https://api.qwant.com/v3/search/images?count=10&q=" + urlPhrase + "%20" + currentSearch.city + "&t=images&safesearch=1&locale=en_US&offset=0&device=desktop";

    // Run fetch
    fetch(imageURL)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log(data);
            var imageThumb = "";
            if (searchResultArr[result].image == "") {
                if (data.data.result.items) {
                    // This allows for multiple images to be an option if the first one does not work
                    for (var i = 0; i < data.data.result.items.length; i++) {
                        imageThumb = data.data.result.items[i].media;
                        if (data.data.result.items[0].media) {
                            break;
                        }
                    }
                    
                }
            } else {
                imageThumb = searchResultArr[result].image;
            }
            
            var searchResult = $("<div>")
                .addClass("search-result grid-x text-left");
                // Just for now, proper CSS later
            var resultImageDiv = $("<div>")
                .addClass("search-image cell small-12 medium-4 large-3")
                .css("background-image", "url('" + imageThumb + "')");
            console.log(resultImageDiv.width());
            /*var resultImage = $("<img>")
                .attr("src", imageThumb);*/
            var resultText = $("<div>")
                .addClass("search-text cell small-12 medium-8 large-9");
            var resultTitle = $("<h2>")
                .text(searchResultArr[result].place);
            var addressEl = $("<p>")
                .addClass("h6 address")
                .text(searchResultArr[result].address);

            //resultImageDiv.append(resultImage);
            resultText
                .append(resultTitle)
                .append(addressEl);
                
            if (searchResultArr[result].web) {
                var webEl = $("<p>")
                    .addClass("h6");
                var webLink = $("<a>")
                    .attr("href", searchResultArr[result].web)
                    .attr("target", "_blank")
                    .text("Visit the website");
                webEl.append(webLink);
                resultText.append(webEl);
            }
            if (searchResultArr[result].description) {
                var descriptionEl = $("<p>")
                    .addClass("h6")
                    .text(searchResultArr[result].description);
                resultText.append(descriptionEl);
            }

            // Create if statement to check if added to itinerary or not
            var buttonText = "+ Add to itinerary"; // - Remove from itinerary
            var addButton = $("<button>")
                .addClass("button submit")
                .text(buttonText)
                .attr("onClick", "toItinerary()");
            function toItinerary() {
                // Function to add and remove itinerary.
            }
            resultText.append(addButton);

            searchResult
                .append(resultImageDiv)
                .append(resultText);

            contentSpace.append(searchResult);

            getHeight();
        });
    }
}

function getHeight() {
    $(".search-image").height($(".search-image").width());
}

// Show how many search results come up
function showResultNumber(number, city) {
    var cityName = city;
    if (city.includes("%20")) {
        cityName = city.replace("%20", " ");
    }
    var searchResultNum = $("<h3>")
        .addClass("text-left")
        .text("There are " + number + " results for " + cityName);
    contentSpace.append(searchResultNum);
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
                for (var i = 0; i < data.data[countryIndex].states.length; i++){
                    availableStates.push(data.data[countryIndex].states[i].name);
                }
                // Functions to run autocomplete
                var selectIem = function(event, ui) {
                    stateInput.val(ui.item.value);
                    return false;
                }
                stateInput.autocomplete({
                    source: availableStates,
                    select: selectIem
                });
                availableStates = [];
            });
        });
}
listCountries();

// Search button
$("input[name='search-type']").on("click", function(){
    var searchType = $("input[name='search-type']:checked").attr("id");
    console.log(searchType);
    return searchType;
});
$("input[name='other-search']").on("click", function(){
    $("input[name='search-type'][id='other-search']").prop("checked", true);
});
if (searchButton.length) {
    searchButton.on("click", function(event) {
        // Prevent default refresh
        event.preventDefault();

        // Get value
        var selectedCity = $("input[name='city']").val();
        var searchType = $("input[name='search-type']:checked").attr("id");

        console.log(selectedCity);
        console.log(searchType);

        // Go to results.html
        window.location.href = "./results.html?city=" + selectedCity + "&type=" + searchType;
        // TEMPORARY DISABLE OF RESULTS SO I CAN READ CONSOLE LOG OF SEARCH FUNCTIONS
        //latLon(selectedCity, "museum");
    });
} else {
    $("input[name='search-type']").on("click", function(){
        var searchType = $("input[name='search-type']:checked").attr("id");
        window.location.href = "./results.html?city=" + currentSearch.city + "&type=" + searchType;
    });
}