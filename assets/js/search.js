var contentSpace = $("#display-content");
var searchButton = $(".explore");

var dummyResults = [
    {
        title: "Winchester Mystery House",
        city: "San Jose",
        address: "Dummy Address, San Jose, CA, USA"
    }, 
    {
        title: "Safdarjung's Tomb",
        city: "New Delhi",
        address: "Dummy Address, New Delhi, Delhi, India"
    }, 
    {
        title: "Osaka Castle",
        city: "Osaka",
        address: "Dummy Address, Osaka, Japan"
    }, 
    {
        title: "Louvre Abu Dhabi",
        city: "Abu Dhabi",
        address: "Dummy Address, Abu Dhabi, UAE"
    },  
    {
        title: "Barangaroo Reserve",
        city: "Sydney",
        address: "Dummy Address, Sydney, NSW, Australia"
    }
];

var searchTyped = [
    {
        identifier: "museum",
        apiParam: "entertainment.museum"
    }
];

var showResultNumber = function(number, city) {
    var cityName = city;
    if (city.includes("%20")) {
        cityName = city.replace("%20", " ");
    }
    var searchResultNum = $("<h2>")
        .text("There are " + number + " results for " + cityName);
    contentSpace.append(searchResultNum);
}

// Search, m8
var displaySearch = function(phrase, city, address, image, web, description) {
    if (phrase) { 
        var urlPhrase = phrase;
    if (phrase.includes("&")) {
        var urlPhrase = phrase.replace("&", "and");
    }
    var imageURL = "https://api.qwant.com/v3/search/images?count=10&q=" + urlPhrase + "%20" + city + "&t=images&safesearch=1&locale=en_US&offset=0&device=desktop";

    // Run fetch
    fetch(imageURL)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log(data);
            var imageThumb = "";
            if (image == "") {
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
                imageThumb = image;
            }
            
            var searchResult = $("<div>")
                .addClass("search-result");
                // Just for now, proper CSS later
            var resultImageDiv = $("<div>")
                .addClass("search-image");
            var resultImage = $("<img>")
                .attr("src", imageThumb)
                .attr("width", "300px");
            var resultText = $("<div>")
                .addClass("search-text");
            var resultTitle = $("<h2>")
                .text(phrase);
            var addressEl = $("<p>")
                .text(address);

            resultImageDiv.append(resultImage);
            resultText
                .append(resultTitle)
                .append(addressEl);
            /*if (phone) {
                var phoneEl = $("<p>").text(phone);
                resultText.append(phoneEl);
            }*/
            if (web) {
                var webEl = $("<a>")
                    .attr("href", web)
                    .attr("target", "_blank")
                    .text("Visit the website");
                resultText.append(webEl);
            }
            if (description) {
                var descriptionEl = $("<p>").text(description);
                resultText.append(descriptionEl);
            }

            searchResult
                .append(resultImageDiv)
                .append(resultText);

            contentSpace.append(searchResult);
        });
    }
}

var getWebURL = function(phrase, city, address, image, description) {
    var searchURL = "https://api.qwant.com/v3/search/web?count=10&q=" + phrase + "%20" + city + "&t=web&safesearch=1&locale=en_US&offset=0&device=desktop";
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
                                webURL = websiteURL;
                                break;
                            }
                        }
                        
                    }
                }
                if (webURL != "") {
                    displaySearch(phrase, city, address, image, webURL, description);
                    break;
                }
            }
            if (webURL == "") {
                displaySearch(phrase, city, address, image, "", description);
            }
        });
}
/*for (var i = 0; i < dummyResults.length; i++) {
    testSearch(dummyResults[i].title, dummyResults[i].city, dummyResults[i].address);
}*/
var getDescription = function(phrase, city, address) {
    if (phrase) { 
    var wikipediaURL = "https://en.wikipedia.org/api/rest_v1/page/summary/" + phrase;

    // Run fetch
    fetch(wikipediaURL)
        .then(function(response) {
            console.log(response.status);
            if (response.ok) {
                response.json().then(function(data) {
                    console.log(data);
                    var description = data.extract;
                    var image = data.originalimage;
                    if (image && !image.source.toLowerCase().includes("logo")) {
                        image = image.source;
                    } else {
                        image = "";
                    }
                    console.log(description);
                    console.log(image);
                    getWebURL(phrase, city, address, image, description);
                });
            } else {
                getWebURL(phrase, city, address, "");
            }
        });
    }
}
/*for (var i = 0; i < dummyResults.length; i++) {
    getDescription(dummyResults[i].title, dummyResults[i].city, dummyResults[i].address);
}*/

var searchResults = function(lat, lon, activity, city) {
    //var placesURL = "https://discover.search.hereapi.com/v1/discover?in=circle:" + lat + "," + lon + ";r=30000&q=" + activity + "&limit=20&apiKey=A_tZEkJx-nLOHsdriahgdmTRUsChHb6iC9uARM11Nb8";
    var placesURL = "https://api.geoapify.com/v2/places?categories=entertainment.museum&filter=circle:" + lon + "," + lat + ",5000&limit=5&apiKey=5f64f49cb696477d8dcdf83ec8fc94f2";

    var numberOfResults = 0;

    // Run fetch
    fetch(placesURL)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log(placesURL);
            console.log(data);
            for (var i = 0; i < data.features.length; i++) {
                var dataItem = data.features[i].properties;
                console.log(dataItem.name);
                /*if (dataItem.contacts) {
                    if (dataItem.contacts[0].www) {
                        var web = dataItem.contacts[0].www[0].value;
                    } else { var web = null; }
                    if (dataItem.contacts[0].phone) {
                        var phone = dataItem.contacts[0].phone[0].value;
                    } else { var phone = null; }
                }
                var address = dataItem.address.label.split(dataItem.title + ", ");
                address = address[address.length - 1];*/
                var address = dataItem.address_line2;
                numberOfResults++;
                getDescription(dataItem.address_line1, city, address);
            }
            showResultNumber(numberOfResults, city);
        });
}

var latLon = function(city, activity) {
    var geocodeURL = "https://geocode.search.hereapi.com/v1/geocode?q=" + city + "&apiKey=A_tZEkJx-nLOHsdriahgdmTRUsChHb6iC9uARM11Nb8";

    // Run fetch
    fetch(geocodeURL)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log(data.items[0].position.lat);
            console.log(data.items[0].position.lng);
            searchResults(data.items[0].position.lat, data.items[0].position.lng, activity, city);
        });
}

//latLon("Istanbul", "museum");

var getSearchInfo = function() {
    // Grab repo name from url query string
    var queryString = document.location.search;

    if (queryString) {
        var citySearch = queryString.split("=")[1];
        citySearch = citySearch.split("&")[0];
        citySearch.replace("%20", " ");
        var searchType = queryString.split("=")[2];
        // Display repo name on the page
        latLon(citySearch, searchType);
    } else {
        // If no repo was given, redirect to the homepage
        //document.location.replace("./index.html");
        console.log("No search");
        var noSearch = $("<h2>")
            .text("This is not a search.");
        contentSpace.append(noSearch);
    }
}
getSearchInfo();

// Search button
if (searchButton.length) {
    console.log("search button exists");
    searchButton.on("click", function(event) {
        // Prevent default refresh
        event.preventDefault();
        console.log("button click works");
        // Get value
        var selectedCity = $("input[name='city']").val();
        var searchType = $("input[name='Historical sites']").val();
        console.log(selectedCity);
        console.log(searchType);

        window.location.href = "./results.html?city=" + selectedCity + "&type=museum";
        //latLon(selectedCity, "museum");
    });
}