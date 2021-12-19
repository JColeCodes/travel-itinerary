$(document).foundation();

function pageInit()
{
    console.log("running pageInit");
}


function pageReady()
{
    console.log("running pageReady");

    var button = document.getElementById("go_to_my_itinerary");
    if (button != null){
        button.addEventListener("click", function(){
            window.location = "itinerary.html";
        });
    }

    /*button = document.getElementById("explore");  
    if (button != null){
        button.addEventListener("click", function(){
            window.location = "results.html";
        });
    }*/

    button = document.getElementById("go_to_search");  
    if (button != null){
        button.addEventListener("click", function(){
            window.location = "index.html";
        });
    }
}
window.onload = pageInit;
jQuery(document).ready(pageReady);

// CALENDAR
/*$(".list-group").on("click", "span", function() {
 
    var date = $(this).text().trim();
  
    var dateInput = $("<input>").attr("type", "text").addClass("form-control").val(date);
  
    $(this).replaceWith(dateInput);

    $("#modalDueDate").datepicker({
    minDate: 1
});
dateInput.datepicker({
    minDate: 1,
    onClose: function() {
      $(this).trigger("change");
    }
  });  
// additional Jquery code
$( ".selector" ).datepicker({
    changeMonth: true
  });

dateInput.trigger("focus");
});*/
$( ".selector" ).datepicker({
  changeMonth: true
});



// Local Storage
var savedPlaces = [];
if ("saved-places" in localStorage) {
  savedPlaces = JSON.parse(localStorage.getItem("saved-places"));
}
function savePlaces() {
  localStorage.setItem("saved-places", JSON.stringify(savedPlaces));
}

var settingsInfo = {
  defaultCountry: null,
  displayCosts: "default"
};
if ("itinerary-settings" in localStorage) {
  settingsInfo = JSON.parse(localStorage.getItem("itinerary-settings"));
}
function saveSettings() {
  localStorage.setItem("itinerary-settings", JSON.stringify(settingsInfo));
}

// SAVE ITINERARY
var savedItinerary = [];

//var dummydata = [{place:"place name"},{place:"place name 2"},{place:"place name 3"}];
function listItems() {
  for (var i = 0; i < savedPlaces.length; i++) {
    var dataName = savedPlaces[i].place;
    var fullSortable = $("<div>")
      .addClass("grid-x hide-time-cost initial-place");
    var timeDiv = $("<div>")
      .addClass("time cell small-2");
    var costDiv = $("<div>")
      .addClass("cost cell small-2");
    var sortdiv = $("<div>").text(dataName).addClass("saved-place cell auto");

    var deleteButton = $("<button>")
      .addClass("delete-place")
      .html("<i class=\"fas fa-times\"></i>")
      .attr("onClick", "removeItem('" + savedPlaces[i].place + "')");

    sortdiv.append(deleteButton);
    fullSortable
      .append(timeDiv)
      .append(sortdiv)
      .append(costDiv);
    $(".initial").append(fullSortable);
  }
}
listItems();

function removeItem(placeName) {
  var placeIndex = savedPlaces.map(obj => obj.place).indexOf(placeName);
  savedPlaces.splice(placeIndex, 1);
  savePlaces();
  $(".initial").html("");
  listItems();
}

// ITINERARY SORTABLE
var sortOne, sortTwo;
$(".list-items, .initial").sortable({
    // enable dragging across lists
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
    over: function(event, ui) {
      $(event.target).addClass("dropover-active");
    },
    out: function(event, ui) {
      $(event.target).removeClass("dropover-active");
    },
    
    update:function(event) {
      /*if ($(event.target).hasClass("initial")) {
        $(event.target).addClass("initial-box");
      } else {
        $(event.target).addClass("itinerary-box");
      }
      var tempArr = [];

      $(this)
        .children()
        .each(function() {
          tempArr.push({
            text: $(this)
              .find("p")
              .text()
              .trim(),
            date: $(this)
              .find("span")
              .text()
              .trim()
          });
        });
  
      var arrName = $(this)
        .attr("id")
        .replace("list-", "");
  
      tasks[arrName] = tempArr;
      saveTasks();*/
    },
    start: function(event, ui) {
      sortOne = sortTwo = ui.item.parent();
    },
    stop: function(event, ui) {
      if ($(ui.item).hasClass("initial-place") && sortOne != sortTwo) {
        $(ui.item).removeClass("hide-time-cost initial-place")
          .addClass("itinerary-place");
      } else if ($(ui.item).hasClass("itinerary-place") && sortOne != sortTwo) {
        $(ui.item).removeClass("itinerary-place")
          .addClass("hide-time-cost initial-place");
      }
    },
      change: function(event, ui) {
        if (ui.sender) {
          sortOne = ui.placeholder.parent();
        }
      }
  });


// DISPLAY DESTINATION
var destinationText = "";

var currentSearch = {};
if ("saved-location" in localStorage) {
  currentSearch = JSON.parse(localStorage.getItem("saved-location"));

  destinationText = currentSearch.city;
  if (currentSearch.state) {
    destinationText += ", " + currentSearch.state;
  }
  if (currentSearch.country) {
    destinationText += ", " + currentSearch.country;
  }
}
var destinationName = $("#destination-name").text(destinationText);


// EDIT BUDGET
var currencyInfo = {
  defaultCurrency: null,
  defaultSymbol: null,
  destinationCurrency: null,
  destinationSymbol: null
};
function showDefaultBudget() {
  if (!currentSearch.budget) {
    var inputBudget = $("<input>")
      .attr("type", "number")
      .attr("min", 1)
      .attr("name", "budget");
    $("#current-budget").find("p").replaceWith(inputBudget);
  } else {
    $("#current-budget").find("p").text(currencyInfo.defaultSymbol + currentSearch.budget);
  }
  $("#current-budget").on("click", "p", function() {
      var getNum = $("#current-budget").find("p").text().trim();
  
      console.log(getNum);
  
      var currentBudgetNum = getNum.replace(currencyInfo.defaultSymbol, "");
  
      console.log(currentBudgetNum);
  
      var inputBudget = $("<input>")
        .attr("type", "number")
        .attr("name", "budget")
        .attr("min", 1)
        .val(currentBudgetNum);
  
      $("#current-budget").find("p").replaceWith(inputBudget);
      inputBudget.trigger("focus");
  });
  
  $("#current-budget").on("blur", "input", function() {
    var textBudgetNum = $("#current-budget").find("input").val().trim();
  
    var displayBudget = $("<p>")
      .text(currencyInfo.defaultSymbol + textBudgetNum);
    
    $("#current-budget").find("input").replaceWith(displayBudget);

    getCurrSymbol(settingsInfo.defaultCountry, "default");
    getCurrSymbol(currentSearch.country, "destination");
  
    currentSearch.budget = textBudgetNum;
    localStorage.setItem("saved-location", JSON.stringify(currentSearch));
  });
}
// Cody's converter code
function convert(currency1, currency2, value) {
  const host = "api.frankfurter.app";
  fetch (
      'https://' + host + '/latest?amount=' + value + '&from=' + currency1 + '&to=' + currency2
  )
  .then((val) => val.json())
  .then((val) => {
          console.log(Object.values(val.rates)[0]);
          $("#local-budget p").text(currencyInfo.destinationSymbol + Object.values(val.rates)[0]);
          var localConversion = $("<span>")
            .addClass("convert-tag")
            .text("(local conversion)");
          $("#local-budget p").append(localConversion);
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
          console.log(data);
          for (var i = 0; i < data.length; i++) {
            if (countryName == data[i].name && searchType == "default") {
              currencyInfo.defaultCurrency = data[i].currency.code;
              currencyInfo.defaultSymbol = data[i].currency.symbol;
              showDefaultBudget();
              break;
            } else if (countryName == data[i].name && searchType == "destination") {
              currencyInfo.destinationCurrency = data[i].currency.code;
              currencyInfo.destinationSymbol = data[i].currency.symbol;
              convert(currencyInfo.defaultCurrency, currencyInfo.destinationCurrency, currentSearch.budget);
              break;
            }
          }
      });
}
getCurrSymbol(settingsInfo.defaultCountry, "default");
getCurrSymbol(currentSearch.country, "destination");
console.log(currentSearch.country);


// EDIT DATE RANGE
if (!currentSearch.startDate) {
  var dateInput = $("<div>")
    .addClass("grid-x")
    .html("<input type='text' name='start' id='start-date' class='cell small-12 large-auto' />\
    <p class='cell shrink date-to'>to</p> \
    <input type='text' name='end' id='end-date' class='cell small-12 large-auto' />");
  $("#time-frame").find("p").replaceWith(dateInput);
} else {
  $("#time-frame").find("p").html("<span id='start-date-span'>" + currentSearch.startDate + "</span> to <span id='end-date-span'>" + currentSearch.endDate + "</span>");
}

$(function() {
  var dateFormat = "mm/dd/yy",
  from = $("#end-date").datepicker({
    defaultDate: "+1w",
    changeMonth: true,
    changeYear: true,
    numberOfMonths: 1,
    dateFormat: "MM d"
  })
  .on("change", function() {
    to.datepicker("option", "minDate", getDate(this));
  }),
  to = $("#start-date").datepicker({
    defaultDate: "+1w",
    changeMonth: true,
    changeYear: true,
    numberOfMonths: 1,
    minDate: 0,
    dateFormat: "MM d"
  })
  .on("change", function() {
    from.datepicker("option", "maxDate", getDate(this));
  });

  function getDate(element) {
    var date;
    try {
      date = $.datepicker.parseDate(dateFormat, element.value);
    } catch(error) {
      date = null;
    }
    return date;
  }
});

$("#time-frame p").on("click", "span", function() {
    var getStartDate = $("#time-frame p").find("#start-date").text().trim(); 
    var getEndDate = $("#time-frame p").find("#end-date").text().trim(); 

    var dateInput = $("<div>")
      .addClass("grid-x")
      .html("<input type='text' name='start' id='start-date' class='cell small-12 large-auto' value='" + getStartDate + "' />\
      <p class='cell shrink date-to'>to</p> \
      <input type='text' name='end' id='end-date' class='cell small-12 large-auto' value='" + getEndDate + "' />");

    $("#time-frame").find("p").replaceWith(dateInput);
    dateInput.trigger("focus");
});

// p, input, div ALL MESSED UP, need to fix!!!

$("#time-frame").on("blur", "input", function() {
  console.log($("#time-frame").find("#start-date").val());
  if ($("#time-frame").find("#start-date").val() && $("#time-frame").find("#end-date").val()){
    var startDateText = $("#time-frame").find("#start-date").val().trim();
    var endDateText = $("#time-frame").find("#end-date").val().trim();

    $("#time-frame").find("div").replaceWith("<span id='start-date-span'>" + startDateText + "</span> to <span id='end-date-span'>" + endDateText + "</span>");

    currentSearch.startDate = startDateText;
    currentSearch.endDate = endDateText;
    //localStorage.setItem("saved-location", JSON.stringify(currentSearch));
  }
});


// SETTINGS
var settingsContentEl = $(".settings-content");

var settingsTitle = $("<h2>")
  .text("Settings");

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
                console.log(countryName);
                option.prop("selected", true);
              }
              countryList.append(option);
          }
      });
}
listCountries();

countryList.on("click", function() {
  var selectedCountry = countryList.val();
  settingsInfo.defaultCountry = selectedCountry;
  saveSettings();
});

var settingsContentDefault = $("<div>")
  .addClass("setting-item")
  .html("<h3>Set your default country</h3>")
  .append(countryList);

var settingsContentDisplayCost = $("<div>")
  .addClass("setting-item")
  .html("<h3>Display costs as...</h3>\
  <div class='radio-select'>\
    <input type='radio' name='search-display' id='default' value='0' checked />\
    <label for='default'>Default Country</label>\
  </div>\
  <div class='radio-select'>\
    <input type='radio' name='search-display' id='destination' value='0' />\
    <label for='destination'>Destination Country</label>\
  </div>");

var settingsContentClearItems = $("<div>")
  .addClass("setting-item")
  .html("<h3>Reset itinerary</h3>\
    <button class='clear-items'>Clear saved activities?</button>");

settingsContentEl
  .append(settingsTitle)
  .append(settingsContentDefault)
  .append(settingsContentDisplayCost)
  .append(settingsContentClearItems);
