var contentSpace = $("#display-content");

var showResultNumber = function(number, city) {
    var searchResultNum = $("<h2>")
        .text("There are " + number + " results for " + city);
    contentSpace.append(searchResultNum);
}

// Search, m8
var getImages = function(phrase, city, web, phone, address) {
    var urlPhrase = phrase;
    if (phrase.includes("&")) {
        var urlPhrase = phrase.replace("&", "and");
    }
    var wikimediaURL = "https://api.qwant.com/v3/search/images?count=10&q=" + urlPhrase + "%20" + city + "&t=images&safesearch=1&locale=en_US&offset=0&device=desktop";

    // Run fetch
    fetch(wikimediaURL)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log(data);
            var image = "";
            if (data.data.result.items) {
                // This allows for multiple images to be an option if the first one does not work
                for (var i = 0; i < data.data.result.items.length; i++) {
                    image = data.data.result.items[i].media;
                    if (data.data.result.items[0].media) {
                        break;
                    }
                }
                
            }

            var searchResult = $("<div>")
                .attr("style", "display: flex; padding: 20px; margin: 0 auto;");
                // Just for now, proper CSS later
            var resultImageDiv = $("<div>");
            var resultImage = $("<img>")
                .attr("src", image)
                .attr("width", "300px");
            var resultText = $("<div>");
            var resultTitle = $("<h2>")
                .text(phrase);
            var addressEl = $("<p>")
                .text(address);
            var phoneEl = $("<p>")
                .text(phone);

            resultImageDiv.append(resultImage);
            resultText
                .append(resultTitle)
                .append(addressEl);
            if (phone) {
                var phoneEl = $("<p>").text(phone);
                resultText.append(phoneEl);
            }
            if (web) {
                var webEl = $("<a>")
                    .attr("href", web)
                    .attr("target", "_blank")
                    .text("Visit the website");
                resultText.append(webEl);
            }

            var hr = $("<hr>");
            resultText.append(hr);

            searchResult
                .append(resultImageDiv)
                .append(resultText);

            contentSpace.append(searchResult);
        });
}
var searchResults = function(lat, lon, activity, city) {
    var placesURL = "https://discover.search.hereapi.com/v1/discover?in=circle:" + lat + "," + lon + ";r=30000&q=" + activity + "&limit=20&apiKey=A_tZEkJx-nLOHsdriahgdmTRUsChHb6iC9uARM11Nb8";

    var numberOfResults = 0;

    // Run fetch
    fetch(placesURL)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log(data);
            for (var i = 0; i < data.items.length; i++) {
                var dataItem = data.items[i];
                console.log(data.items[i].title);
                if (dataItem.contacts) {
                    if (dataItem.contacts[0].www) {
                        var web = dataItem.contacts[0].www[0].value;
                    } else { var web = null; }
                    if (dataItem.contacts[0].phone) {
                        var phone = dataItem.contacts[0].phone[0].value;
                    } else { var phone = null; }
                }
                var address = dataItem.address.label.split(dataItem.title + ", ");
                address = address[address.length - 1];
                numberOfResults++;
                getImages(dataItem.title, city, web, phone, address);
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

latLon("Istanbul", "museum");