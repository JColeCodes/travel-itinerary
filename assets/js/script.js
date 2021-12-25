// Enable Foundation Framework's JS
$(document).foundation();

// Haader button links
function pageReady()
{
  // Go to itinerary page
  var button = document.getElementById("go_to_my_itinerary");
  if (button != null){
      button.addEventListener("click", function(){
          window.location = "./itinerary.html";
      });
  }
  // Go to homepage
  button = document.getElementById("go_to_search");  
  if (button != null){
      button.addEventListener("click", function(){
          window.location = "./index.html";
      });
  }
}
jQuery(document).ready(pageReady);


// GET FROM LOCAL STORAGE
// Saved Places
var savedPlaces = []; // This array holds all "+ Add to itinerary" items from the search
if ("saved-places" in localStorage) {
  savedPlaces = JSON.parse(localStorage.getItem("saved-places"));
}
// Save places, needed for 
function savePlaces() {
  localStorage.setItem("saved-places", JSON.stringify(savedPlaces));
}
// Settings
var settingsInfo = {
  defaultCountry: null,
  displayCosts: "default"
};
if ("itinerary-settings" in localStorage) {
  settingsInfo = JSON.parse(localStorage.getItem("itinerary-settings"));
}
// Save settings function
function saveSettings() {
  localStorage.setItem("itinerary-settings", JSON.stringify(settingsInfo));
}


// SAVE ITINERARY
var savedItinerary; // This array holds all the items in the itinerary (with placement dates), including custom items
if ("itinerary-save-info" in localStorage) {
  // Grab currently saved itinerary info
  savedItinerary = JSON.parse(localStorage.getItem("itinerary-save-info"));
  // Push new items to itinerary if new items exist
  if (savedItinerary.length != savedPlaces.length) {
    var newPlacesTemp = [];
    // For each item in savedPlaces array
    for (var i = 0; i < savedPlaces.length; i++) {
      var arrayMatch;
      // For each item already in savedItinerary, skip
      for (var j = 0; j < savedItinerary.length; j++) {
        if (savedPlaces[i].place == savedItinerary[j].item.place) {
          arrayMatch = true;
          break;
        } else {
          arrayMatch = false;
        }
      }
      // Push only the new ones to a temporary array
      if (!arrayMatch) {
        newPlacesTemp.push({date: null, item: savedPlaces[i]});
      }
    }
    // Concatinate the temporary array to SavedItinerary
    savedItinerary = savedItinerary.concat(newPlacesTemp);
    saveItinerary(); // Save
  }
} else {
  savedItinerary = [];
  // If nothing is in localStorage, add all saved items from search to a new savedItinerary array
  for (var i = 0; i < savedPlaces.length; i++) {
    savedItinerary.push({date: null, item: savedPlaces[i]});
  }
  saveItinerary(); // Save
}
// Save itinerary function
function saveItinerary() {
  localStorage.setItem("itinerary-save-info", JSON.stringify(savedItinerary));
}

// CURRENCY INFO
var currencyInfo = {
  defaultCurrency: null,
  defaultSymbol: "",
  destinationCurrency: null,
  destinationSymbol: ""
};


// CURRENT SEARCH
var currentSearch = {}; // Object that holds current travel information (city, state, country, budget, date range)
if ("saved-location" in localStorage) {
  currentSearch = JSON.parse(localStorage.getItem("saved-location"));

  // Make destination into one string
  var destinationText = currentSearch.city;
  if (currentSearch.state) {
    destinationText += ", " + currentSearch.state;
  }
  if (currentSearch.country) {
    destinationText += ", " + currentSearch.country;
  }
}
$("#destination-name").text(destinationText); // Display on page
// Save current search information function
function saveCurrentSearch() {
  localStorage.setItem("saved-location", JSON.stringify(currentSearch));
}


// ITINERARY PAGE CONTENT
var firstDay = moment(currentSearch.startDate).format("MMMM D, YYYY"); // First day of selected time frame
var lastDay = moment(currentSearch.endDate).format("MMMM D, YYYY"); // Last day of selected time frame
var dayForward = 0; // How many days forward in the navigation
var selectedDate = firstDay; // Selected day defaults with trip's first day
// Unless current day has surpassed beginning of trip
if (moment().isAfter(currentSearch.startDate)) {
  selectedDate = moment().format("MMMM D, YYYY");
}
// Itinerary Content Div
var itineraryContentEl = $(".itinerary-content");

// Display Itinerary Function
function displayItinerary(day) {
  itineraryContentEl.html(""); // Clear previous content
  selectedDate = day; // selectedDay is the day being passed through
  displayDateText = day.split(",")[0]; // Do not display year (year is only for date keeping function)
  // Create previous and next day arrows
  var arrowsEl = $("<div>").addClass("arrows grid-x align-center");
  var prevArrow = $("<button>")
    .attr("id", "prev")
    .html("<i class='fas fa-chevron-left'></i>");
  var nextArrow = $("<button>")
    .attr("id", "next")
    .html("<i class='fas fa-chevron-right'></i>");
  // Label that shows the date above itinerary
  var dayLabel = $("<p>")
    .attr("id", "currentDay")
    .addClass("lead current-day")
    .text(displayDateText);
  // Append date navigation
  arrowsEl
    .append(prevArrow)
    .append(dayLabel)
    .append(nextArrow);

  // Create itinerary table
  var itineraryTable = $("<div>").addClass("itinerary-table");
  var tableTitlesEl = $("<div>").addClass("grid-x table-titles");
  // Table Titles
  var tableTitleTime = $("<div>")
    .addClass("cell small-6 large-2 time")
    .text("Time"); // Time
  var tableTitleActivity = $("<div>")
    .addClass("cell small-12 large-auto saved-place")
    .text("Activity"); // Activity
  var tableTitleCost = $("<div>")
    .addClass("cell small-6 large-2 cost")
    .text("Est. Cost"); // Est. Cost
  tableTitlesEl
    .append(tableTitleTime)
    .append(tableTitleActivity)
    .append(tableTitleCost);

  // Add place for sortable
  var sortableEl = $("<div>").addClass("sortable list-items");

  // Daily Estimation (Auto-calculated daily costs) Div
  var dailyEstimateEl = $("<div>").addClass("grid-x align-right daily-estimate");
  var dailyEstimateLabel = $("<div>")
    .addClass("estimate-label cell auto")
    .text("Daily estimate"); // Label
  var dailyEstimateSymbol = $("<span>"); // Money Symbol
  var dailyEstimateNum = $("<p>"); // P for  calculated number
  var dailyEstimateBox = $("<div>")
    .addClass("estimate-box cell small-6 large-2 grid-x")
    .append(dailyEstimateSymbol)
    .append(dailyEstimateNum);
  dailyEstimateEl
    .append(dailyEstimateLabel)
    .append(dailyEstimateBox);

  // Custom item button
  var customItemButton = $("<button>")
    .addClass("add-to-itinerary")
    .attr("data-open", "customAddModal")
    .html("<i class='fas fa-plus'></i>Add custom activity");

  // Append the itinerary table and items
  itineraryTable
    .append(tableTitlesEl)
    .append(sortableEl)
    .append(dailyEstimateEl)
    .append(customItemButton);
  itineraryContentEl
    .append(arrowsEl)
    .append(itineraryTable);

  // If displaying first day, disable previous arrow; if last day, diable next arrow
  if (firstDay == day) {
    prevArrow.prop("disabled", true);
  } else if (lastDay == day) {
    nextArrow.prop("disabled", true);
  }
  dragDropEnable(day); // Enable drag/drop
  listItems(); // List itinerary items
  autoCalculate(); // Calculate daily costs
}
displayItinerary(selectedDate); // Run on page load

// Previous/Next day button functions
// Previous
$(itineraryContentEl).on("click", "#prev", function() {
  var date;
  // If tomorrow
  if (selectedDate == moment(currentSearch.startDate).add(1, "days").format("MMMM D, YYYY")) {
    dayForward--; // Remove from day forward
    date = firstDay; // Go to today
  } else if (selectedDate > firstDay) { // If any day after tomorrow
    dayForward--; // Remove from day forward
    date = moment(currentSearch.startDate).add(dayForward, "days").format("MMMM D, YYYY"); // Go to one day behind
  }
  displayItinerary(date); // Display itinerary
});
// Next
$(itineraryContentEl).on("click", "#next", function() {
  var date;
  if (selectedDate >= firstDay) {
    dayForward++; // Add to day forward
    date = moment(currentSearch.startDate).add(dayForward, "days").format("MMMM D, YYYY"); // Go to one day ahead
  }
  displayItinerary(date); // Display itinerary
});


// LIST ITINERARY ITEMS
function listItems() {
  // Clear previous content
  $(".initial").html("");
  $(".list-items").html("");
  // For each element saved in the itinerary
  for (var i = 0; i < savedItinerary.length; i++) {
    // Full itinerary item: time, name, cost, website, remove button
    var fullSortable = $("<div>")
      .addClass("grid-x");
    var timeP = $("<p>"); // P for time text
    var costP = $("<p>"); // P for cost text
    var costSymbol = $("<span>"); // Cost symbol
    if (settingsInfo.displayCosts == "default") { // If user wants to view costs in default currency
      costSymbol.text(currencyInfo.defaultSymbol);
      $(".estimate-box span").text(currencyInfo.defaultSymbol);
      $("#custom-cost-symbol").text(currencyInfo.defaultSymbol);
    } else if (settingsInfo.displayCosts == "destination") { // If user wants to view costs in destination currency
      costSymbol.text(currencyInfo.destinationSymbol);
      $(".estimate-box span").text(currencyInfo.destinationSymbol);
      $("#custom-cost-symbol").text(currencyInfo.destinationSymbol);
    }
    var timeDiv = $("<div>") // Time div
      .addClass("cell small-6 large-2 time")
      .append(timeP);
    var costDiv = $("<div>") // Cost div
      .addClass("cell small-6 large-2 grid-x cost")
      .append(costSymbol)
      .append(costP);
    var sortdiv = $("<div>") // Place title div
      .addClass("cell auto saved-place")
      .text(savedItinerary[i].item.place);
    // Website button
    var websiteButton = $("<a>")
      .addClass("web-button")
      .html("<i class='fas fa-link'></i>")
      .attr("target", "_blank")
      .attr("href", savedItinerary[i].item.web);
    // Delete button
    var deleteButton = $("<button>")
      .addClass("delete-place")
      .html("<i class=\"fas fa-times\"></i>")
      .attr("onClick", "removeItem('" + savedItinerary[i].item.place + "')");

    // If the itinerary item has no date (is unsorted)
    if (savedItinerary[i].date == null) {
      fullSortable.addClass("hide-time-cost initial-place"); // Hide time/cost, sidebar style
      $(".initial").append(fullSortable); // Append to sidebar
    }
    // If the itinerary item has the selected date (other dates don't show until it is selected)
    else if (savedItinerary[i].date == selectedDate) {
      fullSortable.addClass("itinerary-place"); // Itinerary style
      if (savedItinerary[i].item.time) { // If a time is saved, add time text
        timeP.text(moment().hour(savedItinerary[i].item.time).minute(0).format("h:mm A"));
      }
      if (savedItinerary[i].item.cost) { // If a cost is saved, add cost text
        costP.text(savedItinerary[i].item.cost);
      }
      $(".itinerary-content").find(".list-items").append(fullSortable); // Append to main itinerary
      // If there is no website, hide the link button
      if (!savedItinerary[i].item.web) {
        websiteButton.addClass("hidden");
      }
    }
    // Append!
    sortdiv
      .append(websiteButton)
      .append(deleteButton);
    fullSortable
      .append(timeDiv)
      .append(sortdiv)
      .append(costDiv);
  }
}

// ITINERARY CLICK TO EDIT
// Create hour selection
function createHourSelect(timeText) {
  var inputTime = $("<select>") // Select
    .attr("name", "time-select")
    .val(timeText);
  for (var i = 0; i < 24; i++) { // For every hour in a day
    var optionText = moment().hour(i).minute(0).format("h:mm A"); // Display hour in 12 hour AM/PM format
    var optionTime = $("<option>") // Option
      .val(i) // Log hour as number between 0-23
      .text(optionText);
    if (optionText == timeText) {
      optionTime.prop("selected", true); // If there is already a date, select it
    }
    inputTime.append(optionTime); // Append the hour options to the select
  }
  return inputTime;
}
// Create cost input
function createCostInput(costText) {
  var inputCost = $("<input>") // Create number input
    .attr("type", "number")
    .attr("min", 1) // Minimum amount of 1
    .attr("name", "cost-input")
    .addClass("cell auto")
    .val(costText);
  return inputCost;
}

// When you click on the time box
$(".itinerary-content").on("click", ".time", function(event) {
  event.stopPropagation();
  var timeText = $(this).find("p").text(); // Grab current text
  $(this).find("p").replaceWith(createHourSelect(timeText)); // Replace the p with the select
  $("select").trigger("focus"); // Focus on the select
});
// When you click off the time box
$(".itinerary-content").on("blur", ".time", function(event) {
  var timeText = moment().hour($(event.target).val()).minute(0).format("h:mm A"); // Set hour in 12 hour AM/PM format
  var saveTime = $("<p>")
    .text(timeText);
  for (var i = 0; i < savedItinerary.length; i++) {
    if (savedItinerary[i].item.place == $(this).parent().children(".saved-place").text()) {
      savedItinerary[i].item.time = parseInt($(event.target).val()); // Add input time to itinerary object
    }
  }
  saveItinerary(); // Save itinerary info
  $(event.target).replaceWith(saveTime); // Replace select with p
});
// When you click on the cost box
$(".itinerary-content").on("click", ".cost", function(event) {
  event.stopPropagation();
  var costText = $(this).find("p").text(); // Grab current text
  $(this).find("p").replaceWith(createCostInput(costText)); // Replace the p with the input
  $("input").trigger("focus"); // Focus on the input
});
// When you click off the cost box
$(".itinerary-content").on("blur", ".cost", function(event) {
  var costText = parseFloat($(event.target).val()); // Get cost as a decimal number (float)
  var saveCost = $("<p>")
    .text(costText);
  for (var i = 0; i < savedItinerary.length; i++) {
    if (savedItinerary[i].item.place == $(this).parent().children(".saved-place").text()) {
      savedItinerary[i].item.cost = costText; // Add input cost to itinerary object
    }
  }
  saveItinerary(); // Save itinerary info
  $(event.target).replaceWith(saveCost); // Replace input with p
  autoCalculate(); // Automatically calculate daily total cost
});

// DELETE ITEM FROM ITINERARY
function removeItem(placeName) {
  var placeIndex = savedPlaces.map(obj => obj.place).indexOf(placeName); // Find index of selected place
  savedPlaces.splice(placeIndex, 1); // Remove from array
  savePlaces(); // Save places
  listItems(); // Re-list items now with the removed one gone
}

// ITINERARY SORTABLE
function dragDropEnable(selectedDate) {
  var sortOne, sortTwo;
  $(".list-items, .initial").sortable({
      // Enable dragging across lists
      connectWith: $(".list-items, .initial"),
      scroll: false,
      tolerance: "pointer",
      helper: "clone",
      activate: function() {
        $(this).addClass("dropover");
      },
      deactivate: function() {
        $(this).removeClass("dropover");
      },
      over: function(event) {
        $(event.target).addClass("dropover-active");
      },
      out: function(event) {
        $(event.target).removeClass("dropover-active");
      },
      // Update function
      update: function(event, ui) {
        if (!ui.sender) { // Prevents potentially running multiple times
          var currDayTemp = []; // Temporary array for current day
          var otherDayTemp = []; // Temporary array for other days

          // Check if item has a date saved or not
          if ($(ui.item).parent().hasClass("list-items")) {
            var isDay = true;
          } else if ($(ui.item).parent().hasClass("initial")) {
            var isDay = false;
          }
          
          // For every item in saved itinerary
          for (var i = 0; i < savedItinerary.length; i++) {
            // If item is dragged from saved activities to itinerary, add a date
            if (savedItinerary[i].item.place == $(ui.item).children(".saved-place").text() && isDay) {
              savedItinerary[i].date = selectedDate;
            }
            // Else if item is dragged from itinerary to saved activities, remove date
            else if (savedItinerary[i].item.place == $(ui.item).children(".saved-place").text() && !isDay) {
              savedItinerary[i].date = null;
            }
            // If item does not have today's date, add it to temporary other day array - for custom order
            if ((savedItinerary[i].date != null && !isDay) || (savedItinerary[i].date != selectedDate && isDay)) {
              otherDayTemp.push(savedItinerary[i]);
            }
          }
          // For each child in itinerary, add to temporary current day array - for saving custom order
          $(this).children().each(function() {
            var orderedTitle = $(this).find(".saved-place").text();
            for (var i = 0; i < savedItinerary.length; i++) {
              if (orderedTitle == savedItinerary[i].item.place) {
                currDayTemp.push(savedItinerary[i]);
              }
            }
          });
          // Concatenate current day array and other day arrays together 
          var newArrTemp = currDayTemp.concat(otherDayTemp);

          // If an item is moved within the same parent (rearranging order), saved itinerary should be replaced with the temp array
          if (($(event.target).hasClass("initial") && $(ui.item).parent().hasClass("initial")) || ($(event.target).hasClass("list-items") && $(ui.item).parent().hasClass("list-items"))) {
            savedItinerary = newArrTemp;
          } // Else, leave saved itinerary as is
          saveItinerary(); // Save to local storage
        }
      },
      start: function(event, ui) {
        sortOne = sortTwo = ui.item.parent(); // Assign parent at start
      },
      stop: function(event, ui) {
        // Toggle styles for itinerary item depending on where is is dragged
        if ($(ui.item).hasClass("initial-place") && sortOne != sortTwo) {
          $(ui.item)
            .removeClass("hide-time-cost initial-place") // If initial, remove initial style
            .addClass("itinerary-place"); // Add itinerary style
        } else if ($(ui.item).hasClass("itinerary-place") && sortOne != sortTwo) {
          $(ui.item)
            .removeClass("itinerary-place") // If itinerary, remove itinerary style
            .addClass("hide-time-cost initial-place"); // Add initial style
        }
      },
      change: function(event, ui) {
        if (ui.sender) {
          sortOne = ui.placeholder.parent(); // Assign parent on change
        }
      }
  });
}


// EDIT BUDGET
function showDefaultBudget() {
  // If there is no budget already saved, display input box
  if (!currentSearch.budget) {
    var inputBudget = $("<input>")
      .attr("type", "number")
      .attr("min", 1)
      .attr("name", "budget");
    $("#current-budget").find("p").replaceWith(inputBudget);
  } else { // If there is a budget, display the budget
    $("#current-budget").find("p").text(currencyInfo.defaultSymbol + currentSearch.budget);
  }
  // If current budget is clicked on
  $("#current-budget").on("click", "p", function() {
      var getNum = $("#current-budget").find("p").text().trim(); // Get the current text
      // Remove default sumbol to work only with the number
      var currentBudgetNum = getNum.replace(currencyInfo.defaultSymbol, "");
  
      var inputBudget = $("<input>") // Create input
        .attr("type", "number")
        .attr("name", "budget")
        .attr("min", 1)
        .val(currentBudgetNum);
  
      $("#current-budget").find("p").replaceWith(inputBudget); // Replace budget p with input
      inputBudget.trigger("focus"); // Focus on input
  });
  // If current budget is clicked off
  $("#current-budget").on("blur", "input", function() {
    var textBudgetNum = $("#current-budget").find("input").val().trim(); // Get input value
  
    var displayBudget = $("<p>") // Create p with both symbol and budget number
      .text(currencyInfo.defaultSymbol + textBudgetNum);
    
    $("#current-budget").find("input").replaceWith(displayBudget); // Replace budget input with p

    // Gets country currency information on change
    getCurrSymbol(settingsInfo.defaultCountry, "default");
    getCurrSymbol(currentSearch.country, "destination");
  
    currentSearch.budget = textBudgetNum;
    saveCurrentSearch(); // Save new budget to localStorage
  });
}
showDefaultBudget(); // Automatically run on page load

// List of the currencies that don't use decimals
var zeroDecimal = ["BIF", "CLP", "DJF", "GNF", "ISK", "JPY", "KMF", "KRW", "PYG", "RWF", "UGX", "UYI", "VND", "VUV", "XAF", "XOF", "XPF"];

// Cody's converter code
function convert(currency1, currency2, value , type, placeName) {
  var convertURL = "https://api.exchangerate.host/convert?amount=" + value + "&from=" + currency1 + "&to=" + currency2 + "&places=2";
  fetch ( convertURL )
  .then((val) => val.json())
  .then((val) => {
        var convertedBudget = val.result; // Get conversion
        for (var i = 0; i < zeroDecimal.length; i++) {
          if (currency2 == zeroDecimal[i]) { // If currency converted to does not use decimals, round the number
            convertedBudget = Math.round(val.result);
            break;
          }
        }
        // Display converted budget
        if (type == "budget") {
          $("#local-budget p").text(currencyInfo.destinationSymbol + convertedBudget);
          var localConversion = $("<span>")
            .addClass("convert-tag")
            .text("(local conversion)");
          $("#local-budget p").append(localConversion); // Display destination conversion below budget
        }
        // Display converted costs listed in itinerary
        else if (type == "cost") {
          for (var i = 0; i < savedItinerary.length; i++) {
            if (savedItinerary[i].item.place == placeName) { // Find item in itinerary
              savedItinerary[i].item.cost = convertedBudget; // Update cost to new currency
            }
          }
          saveItinerary(); // Save itinerary
          listItems(); // Show itinerary list with updates
          autoCalculate(); // Automatically calculate daily total, but with new currency numbers
        }
    });
}

// GET CURRENCIES
function getCurrSymbol(countryName, searchType) {
  var url = "https://raw.githubusercontent.com/mansourcodes/country-databases/main/country-currancy-flag-phone-code.json";

  // Run fetch
  fetch(url)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
      // Loop through data
      for (var i = 0; i < data.length; i++) {
        if (countryName == data[i].name && searchType == "default") { // For default currency, based on country
          currencyInfo.defaultCurrency = data[i].currency.code; // Currency code (i.e. USD)
          currencyInfo.defaultSymbol = data[i].currency.symbol; // Currency symbol (i.e. $)
          showDefaultBudget(); // Show budget
          break;
        } else if (countryName == data[i].name && searchType == "destination") { // For destination currency, based on country
          currencyInfo.destinationCurrency = data[i].currency.code; // Currency code (i.e. GBP)
          currencyInfo.destinationSymbol = data[i].currency.symbol; // Currency symbol (i.e. £)
          convert(currencyInfo.defaultCurrency, currencyInfo.destinationCurrency, currentSearch.budget, "budget"); // Convert the default currency to destination
          break;
        }
      }
      listItems(); // List items
    });
}
getCurrSymbol(settingsInfo.defaultCountry, "default"); // On load, get default currency
getCurrSymbol(currentSearch.country, "destination"); // On load, get destination currency


// AUTO-CALCULATE COSTS FOR THE DAY
function autoCalculate() {
  var dailyTotal = 0; // Default total is 0
  $(".cost p").each(function() { // For each cost in itinerary for the day
    var itemCost = parseFloat($(this).text()); // Get float (decimal) number
    if (isNaN(itemCost)) {
      itemCost = 0; // If there is no numerical value, cost is 0
    }
    dailyTotal += itemCost; // Add costs together
  });
  $(".estimate-box p").text(dailyTotal); // Display total
}


// EDIT DATE RANGE
if (!currentSearch.startDate) {
  // If there is no date already saved, display input boxes
  var startDateInput = $("<input>") // Input for start date
    .addClass("cell small-12 large-auto")
    .attr("type", "text")
    .attr("name", "start")
    .attr("id", "start-date-input");
  var endDateInput = $("<input>") // Input for end date
    .addClass("cell small-12 large-auto")
    .attr("type", "text")
    .attr("name", "end")
    .attr("id", "end-date-input");
  $("#time-frame").find("#start-date-span").replaceWith(startDateInput);
  $("#time-frame").find("#end-date-span").replaceWith(endDateInput);
} else { // If there is a date saved, display date (without showing year)
  $("#time-frame").find("#start-date-span").text(currentSearch.startDate.split(",")[0]);
  $("#time-frame").find("#end-date-span").text(currentSearch.endDate.split(",")[0]);
}

// If you click on the start date, you can edit it
$("#time-frame").on("click", "#start-date-span", function() {
    var getStartDate = $("#time-frame").find("#start-date-span").text().trim(); // Get date text
    var dateInput = $("<input>") // Make input box and make date text current value
      .addClass("cell small-12 large-auto")
      .attr("type", "text")
      .attr("name", "start")
      .attr("id", "start-date-input")
      .val(getStartDate);
    $("#time-frame").find("#start-date-span").replaceWith(dateInput); // Replace span with input
    dateInput.trigger("focus"); // Focus on input
});
// If you click on the end date, you can edit it
$("#time-frame").on("click", "#end-date-span", function() {
    var getEndDate = $("#time-frame").find("#end-date-span").text().trim(); // Get date text
    var dateInput = $("<input>") // Make input box and make date text current value
      .addClass("cell small-12 large-auto")
      .attr("type", "text")
      .attr("name", "end")
      .attr("id", "end-date-input")
      .val(getEndDate);
    $("#time-frame").find("#end-date-span").replaceWith(dateInput); // Replace span with input
    dateInput.trigger("focus"); // Focus on input
});

// When start date input value is changed
$("#time-frame").on("change", "#start-date-input", function() {
  var startDateText = $("#time-frame").find("#start-date-input").val().trim(); // Get date value
  var displayStartDate = $("<span>") // Make span with input ate as current text
    .addClass("cell small-12 large-shrink date-to")
    .attr("id", "start-date-span")
    .text(startDateText.split(",")[0]);
  $("#time-frame").find("#start-date-input").replaceWith(displayStartDate); // Replace input with span
  currentSearch.startDate = startDateText; // Edit start date in localStorage
  saveCurrentSearch();
  // Date format
  firstDay = moment(currentSearch.startDate).format("MMMM D, YYYY");
  if (moment().isAfter(currentSearch.startDate)) {
    displayItinerary(moment().format("MMMM D, YYYY"));
  } else {
    displayItinerary(firstDay);
  }
});
// When end date input value is changed
$("#time-frame").on("change", "#end-date-input", function() {
  var endDateText = $("#time-frame").find("#end-date-input").val().trim(); // Get date value
  var displayEndDate = $("<span>") // Make span with input ate as current text
    .addClass("cell small-12 large-shrink date-to")
    .attr("id", "end-date-span")
    .text(endDateText.split(",")[0]);
  $("#time-frame").find("#end-date-input").replaceWith(displayEndDate); // Replace input with span
  currentSearch.endDate = endDateText; // Edit start date in localStorage
  saveCurrentSearch();
  // Date format
  lastDay = moment(currentSearch.endDate).format("MMMM D, YYYY");
  if (moment().isAfter(currentSearch.startDate)) {
    displayItinerary(moment().format("MMMM D, YYYY"));
  } else {
    displayItinerary(firstDay);
  }
});
// DATEPICKER
$("#time-frame").on("focus", "input", function() {
  var dateFormat = "mm/dd/yy",
  from = $("#time-frame").find("#end-date-input").datepicker({ // Datepicker for end date
    defaultDate: "+1w",
    changeMonth: true,
    changeYear: true,
    numberOfMonths: 1,
    minDate: 0,
    dateFormat: "MM d, yy"
  })
  .on("change", function() { // jQuery UI documentation said to add this
    to.datepicker("option", "minDate", getDate(this));
  }),
  to = $("#time-frame").find("#start-date-input").datepicker({ // Date picker for start date
    defaultDate: "+1w",
    changeMonth: true,
    changeYear: true,
    numberOfMonths: 1,
    minDate: 0,
    dateFormat: "MM d, yy"
  })
  .on("change", function() { // jQuery UI documentation said to add this
    from.datepicker("option", "maxDate", getDate(this));
  });
  function getDate(element) { // jQuery UI documentation said to add this
    var date;
    try {
      date = $.datepicker.parseDate(dateFormat, element.value);
    } catch(error) {
      date = null;
    }
    return date;
  }
});


// ADD CUSTOM ACTIVITY
for (var i = 0; i < 24; i++) { // Create options for each hour in a day
  var optionText = moment().hour(i).minute(0).format("h:mm A");
  var optionTime = $("<option>")
  .val(i)
  .text(optionText);
  $("select[name='custom-time']").append(optionTime); // Append to select
}
// Create custom activity
function customActivity() {
  if ($("input[name='custom-activity']").val()){ // Run function content only if an activity is written in
    // Create an object from the information in the form
    var customObject = {
      date: selectedDate,
      item: {
        place: $("input[name='custom-activity']").val(),
        time: parseInt($("select[name='custom-time']").val()),
        cost: parseFloat($("input[name='custom-cost']").val()),
        web: null
      }
    }
    // Close the create custom activity modal
    $("#submit-custom").attr("data-close","");
    // Push to itinerary and save
    savedItinerary.push(customObject);
    saveItinerary();
    listItems(); // Reload itinerary with custom item added on
  }
}


// SETTINGS
var settingsContentEl = $(".settings-content"); // Settings Div

var settingsTitle = $("<h2>") // Title for settings modal
  .text("Settings");

 // Get a list of all countries and add them as options to select
var countryList = $("<select>")
  .attr("name", "default-country");
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
              if (countryName == settingsInfo.defaultCountry) {
                option.prop("selected", true); // Select default country if one is saved
              }
              countryList.append(option);
          }
      });
}
listCountries(); // Automatically get countries

// When select is clicked, save selection as dafault country
countryList.on("click", function() {
  var selectedCountry = countryList.val();
  settingsInfo.defaultCountry = selectedCountry;
  saveSettings();
});

// Default country selection
var settingsContentDefault = $("<div>")
  .addClass("setting-item")
  .html("<h3>Set your default country</h3>")
  .append(countryList);

// Radio select for display currency for costs (default vs destination)
var settingsContentDisplayCost = $("<div>")
  .addClass("setting-item")
  .html("<h3>Display costs as...</h3>\
  <div class='radio-select'>\
    <input type='radio' name='search-display' id='default' value='0' />\
    <label for='default'>Default Country</label>\
  </div>\
  <div class='radio-select'>\
    <input type='radio' name='search-display' id='destination' value='0' />\
    <label for='destination'>Destination Country</label>\
  </div>");

// Button for clearing everything to make a new itinerary
var settingsContentClearItems = $("<div>")
  .addClass("setting-item")
  .html("<h3>Reset itinerary</h3>\
    <button class='clear-items'>Clear saved activities?</button>");

// Append to settings modal
settingsContentEl
  .append(settingsTitle)
  .append(settingsContentDefault)
  .append(settingsContentDisplayCost)
  .append(settingsContentClearItems);

// For each radio selection
$("input[name='search-display']").each( function() {
  if ($(this).attr("id") == settingsInfo.displayCosts) {
    $(this).prop("checked", true).prop("disabled", true); // The checked selection is disabled
  }
});
// When display currency radio is clicked on
settingsContentDisplayCost.on("click", "input[name='search-display']", function(event) {
  $("input[name='search-display']").prop("disabled", false);
  $(event.target).prop("checked", true).prop("disabled", true); // The newly checked selection is disabled
  settingsInfo.displayCosts = $(event.target).attr("id"); // Save to local storage as "default" or "destination"
  saveSettings();
  if (settingsInfo.displayCosts == "default") { // If "default"
    var curr1 = currencyInfo.destinationCurrency;
    var curr2 = currencyInfo.defaultCurrency;
  } else { // If "destination"
    var curr1 = currencyInfo.defaultCurrency;
    var curr2 = currencyInfo.destinationCurrency;
  }
  $(".cost p").each(function() { // For each cost in itinerary, convert
    var placeName = $(this).parent().parent().children(".saved-place").text();
    convert(curr1, curr2, $(this).text(), "cost", placeName);
  });
});

// DELETE BUTTON
settingsContentClearItems.on("click", ".clear-items", function() {
  // Removes all localStorage information to start fresh
  localStorage.removeItem("saved-places");
  localStorage.removeItem("saved-location");
  localStorage.removeItem("itinerary-settings");
  localStorage.removeItem("itinerary-save-info");
  // Redirects to index
  window.location = "./index.html";
});