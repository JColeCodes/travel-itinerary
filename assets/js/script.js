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
});
$( ".selector" ).datepicker({
  changeMonth: true
});
*/


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
var savedItinerary;
console.log(savedItinerary);
if ("itinerary-save-info" in localStorage) {
  savedItinerary = JSON.parse(localStorage.getItem("itinerary-save-info"));
} else {
  savedItinerary = [];
  for (var i = 0; i < savedPlaces.length; i++) {
    savedItinerary.push({date: null, item: savedPlaces[i]});
    /*console.log(savedPlaces[i]);
    for (var a = 0; a < savedItinerary.length; a++) {
      if (savedItinerary[a].date == null) {
        savedItinerary[a].items.push(savedPlaces[i]);
      }
    }*/
  }
  saveItinerary();
}
function saveItinerary() {
  localStorage.setItem("itinerary-save-info", JSON.stringify(savedItinerary));
}


var currencyInfo = {
  defaultCurrency: null,
  defaultSymbol: null,
  destinationCurrency: null,
  destinationSymbol: null
};

/*
for (var i = 0; i < savedPlaces.length; i++) {

}*/

var currentSearch = {};
if ("saved-location" in localStorage) {
  currentSearch = JSON.parse(localStorage.getItem("saved-location"));

  var destinationText = currentSearch.city;
  if (currentSearch.state) {
    destinationText += ", " + currentSearch.state;
  }
  if (currentSearch.country) {
    destinationText += ", " + currentSearch.country;
  }
}
var destinationName = $("#destination-name").text(destinationText);


// ITINERARY PAGE CONTENT
var firstDay = moment(currentSearch.startDate).format("MMMM D, YYYY");
var lastDay = moment(currentSearch.endDate).format("MMMM D, YYYY");
var dayForward = 0;
var selectedDate = firstDay;

console.log(firstDay, "first day");
console.log(lastDay, "last day");
console.log(selectedDate, "selected day");

var itineraryContentEl = $(".itinerary-content");

function displayItinerary(day) {
  itineraryContentEl.html("");
  selectedDate = day;
  displayDateText = day.split(",")[0];
  var arrowsEl = $("<div>").addClass("arrows grid-x align-center");
  var prevArrow = $("<button>")
    .attr("id", "prev")
    .html("<i class='fas fa-chevron-left'></i>");
  var nextArrow = $("<button>")
    .attr("id", "next")
    .html("<i class='fas fa-chevron-right'></i>");
  var dayLabel = $("<p>")
    .attr("id", "currentDay")
    .addClass("lead current-day")
    .text(displayDateText);
  arrowsEl
    .append(prevArrow)
    .append(dayLabel)
    .append(nextArrow);

  var itineraryTable = $("<div>").addClass("itinerary-table");
  var tableTitlesEl = $("<div>").addClass("grid-x table-titles");
  var tableTitleTime = $("<div>")
    .addClass("cell small-2")
    .text("Time");
  var tableTitleActivity = $("<div>")
    .addClass("cell auto")
    .text("Activity");
  var tableTitleCost = $("<div>")
    .addClass("cell small-2")
    .text("Est. Cost");
  tableTitlesEl
    .append(tableTitleTime)
    .append(tableTitleActivity)
    .append(tableTitleCost);

  var sortableEl = $("<div>").addClass("sortable list-items");

  var dailyEstimateEl = $("<div>").addClass("grid-x align-right daily-estimate hidden");
  var dailyEstimateLabel = $("<div>")
    .addClass("estimate-label cell auto")
    .text("Daily estimate");
  var dailyEstimateSymbol = $("<span>");
  var dailyEstimateNum = $("<p>");
  var dailyEstimateBox = $("<div>")
    .addClass("estimate-box cell small-2 grid-x")
    .append(dailyEstimateSymbol)
    .append(dailyEstimateNum);
  dailyEstimateEl
    .append(dailyEstimateLabel)
    .append(dailyEstimateBox);

  var customItemButton = $("<button>")
    .addClass("add-to-itinerary")
    .attr("data-open", "customAddModal")
    .html("<i class='fas fa-plus'></i>Add custom activity");

  itineraryTable
    .append(tableTitlesEl)
    .append(sortableEl)
    .append(dailyEstimateEl)
    .append(customItemButton);
  itineraryContentEl
    .append(arrowsEl)
    .append(itineraryTable);

    if ($(".list-items").length) {
      dailyEstimateEl.removeClass("hidden");
    }

  if (firstDay == day) {
    prevArrow.prop("disabled", true);
  } else if (lastDay == day) {
    nextArrow.prop("disabled", true);
  }
  dragDropEnable(day);
  listItems();
  autoCalculate();
}
displayItinerary(firstDay);

// Button functions
$(itineraryContentEl).on("click", "#prev", function() {
  var date;
  if (selectedDate == moment(currentSearch.startDate).add(1, "days").format("MMMM D, YYYY")) {
    dayForward--;
    date = firstDay;
  } else if (selectedDate > firstDay) {
    dayForward--;
    date = moment(currentSearch.startDate).add(dayForward, "days").format("MMMM D, YYYY");
  }
  if (lastDay == selectedDate) {
    itineraryContentEl.find("#prev").prop("disabled", false);
  }
  console.log(date, dayForward);
  displayItinerary(date);
});
$(itineraryContentEl).on("click", "#next", function() {
  var date;
  if (selectedDate == firstDay || selectedDate > firstDay) {
    dayForward++;
    date = moment(currentSearch.startDate).add(dayForward, "days").format("MMMM D, YYYY");
  }
  if (firstDay == selectedDate) {
    itineraryContentEl.find("#next").prop("disabled", false);
  }
  console.log(date, dayForward);
  displayItinerary(date);
});

//console.log(moment(currentSearch.startDate).format("MMMM D, YYYY"));


//var dummydata = [{place:"place name"},{place:"place name 2"},{place:"place name 3"}];
function listItems() {
  $(".initial").html("");
  $(".list-items").html("");
  for (var i = 0; i < savedPlaces.length; i++) {
    //var dataName = savedPlaces[i].place;
    var fullSortable = $("<div>")
      .addClass("grid-x");
    var timeP = $("<p>");
    var costP = $("<p>");
    var costSymbol = $("<span>");
    if (settingsInfo.displayCosts == "default") {
      costSymbol.text(currencyInfo.defaultSymbol);
      $(".estimate-box span").text(currencyInfo.defaultSymbol);
    } else if (settingsInfo.displayCosts == "destination") {
      costSymbol.text(currencyInfo.destinationSymbol);
      $(".estimate-box span").text(currencyInfo.destinationSymbol);
    }
    var timeDiv = $("<div>")
      .addClass("time cell small-2")
      .append(timeP);
    var costDiv = $("<div>")
      .addClass("cost cell small-2 grid-x")
      .append(costSymbol)
      .append(costP);
    var sortdiv = $("<div>").addClass("saved-place cell auto");

    var websiteButton = $("<a>")
      .addClass("web-button")
      .html("<i class='fas fa-link'></i>")
      .attr("target", "_blank");

    var deleteButton = $("<button>")
      .addClass("delete-place")
      .html("<i class=\"fas fa-times\"></i>");

    console.log(savedPlaces);
    console.log(savedItinerary);

    for (var j = 0; j < savedItinerary.length; j++) {
      console.log("savedItinerary[j].date", savedItinerary[j].date);
      console.log("selected date", selectedDate);
      if (savedItinerary[j].date == null && savedItinerary[j].item.place == savedPlaces[i].place) {
        /*for (var k = 0; k < savedItinerary[j].items.length; k++) {
          if (savedItinerary[a].items[n].place == savedPlaces[i].place){
            sortdiv.text(savedItinerary[a].items[n].place);
            websiteButton.attr("href", savedItinerary[a].items[n].web);
            deleteButton.attr("onClick", "removeItem('" + savedItinerary[a].items[n].place + "')");
            fullSortable.addClass("hide-time-cost initial-place");
            $(".initial").append(fullSortable);
            console.log(savedItinerary[a].items[n]);
          }
        }*/
      console.log("savedItinerary[j].item.place", savedItinerary[j].item.place);
        sortdiv.text(savedItinerary[j].item.place);
        websiteButton.attr("href", savedItinerary[j].item.web);
        deleteButton.attr("onClick", "removeItem('" + savedItinerary[j].item.place + "')");
        fullSortable.addClass("hide-time-cost initial-place");
        $(".initial").append(fullSortable);
      } else if (savedItinerary[j].date == selectedDate && savedItinerary[j].item.place == savedPlaces[i].place) {
        /*for (var n = 0; n < savedItinerary[a].items.length; n++) {
          if (savedItinerary[a].items[n].place == savedPlaces[i].place){
            sortdiv.text(savedItinerary[a].items[n].place);
            websiteButton.attr("href", savedItinerary[a].items[n].web);
            deleteButton.attr("onClick", "removeItem('" + savedItinerary[a].items[n].place + "')");
            fullSortable.addClass("itinerary-place");
            $(".itinerary-content").find(".list-items").append(fullSortable);
            console.log(savedItinerary[a].items[n]);
          }
        }*/
        sortdiv.text(savedItinerary[j].item.place);
        websiteButton.attr("href", savedItinerary[j].item.web);
        deleteButton.attr("onClick", "removeItem('" + savedItinerary[j].item.place + "')");
        fullSortable.addClass("itinerary-place");
        if (savedItinerary[j].item.time) {
          timeP.text(moment().hour(savedItinerary[j].item.time).minute(0).format("h:mm A"));
        }
        if (savedItinerary[j].item.cost) {
          costP.text(savedItinerary[j].item.cost);
        }
        $(".itinerary-content").find(".list-items").append(fullSortable);
      }
    }
    sortdiv
      .append(websiteButton)
      .append(deleteButton);
    fullSortable
      .append(timeDiv)
      .append(sortdiv)
      .append(costDiv);
  }
}
//listItems();

function createHourSelect(timeText) {
  var inputTime = $("<select>")
    .attr("name", "time-select")
    .val(timeText);
  for (var i = 0; i < 24; i++) {
    var optionText = moment().hour(i).minute(0).format("h:mm A");
    var optionTime = $("<option>")
      .val(i)
      .text(optionText);
    if (optionText == timeText) {
      optionTime.prop("selected", true);
    }
    inputTime.append(optionTime);
  }
  return inputTime;
}
function createCostInput(costText) {
  var inputCost = $("<input>")
    .attr("type", "number")
    .attr("min", 1)
    .attr("name", "cost-input")
    .addClass("cell auto")
    .val(costText);
  return inputCost;
}

$(".itinerary-content").on("click", ".time", function(event) {
  event.stopPropagation();
  var timeText = $(this).find("p").text();
  $(this).find("p").replaceWith(createHourSelect(timeText));
  $("select").trigger("focus");
});
/*$(".itinerary-content .time").on("click", "p", function(event) {
  var timeText = $(event.target).text();
  $(event.target).replaceWith(createHourSelect(timeText));
  $("select").trigger("focus");
});*/
$(".itinerary-content").on("blur", ".time", function(event) {
  var timeText = moment().hour($(event.target).val()).minute(0).format("h:mm A");
  var saveTime = $("<p>")
    .text(timeText);
  console.log($(this).parent().children(".saved-place").text());
  for (var i = 0; i < savedItinerary.length; i++) {
    if (savedItinerary[i].item.place == $(this).parent().children(".saved-place").text()) {
      savedItinerary[i].item.time = parseInt($(event.target).val());
    }
  }
  saveItinerary();
  $(event.target).replaceWith(saveTime);
});

$(".itinerary-content").on("click", ".cost", function(event) {
  event.stopPropagation();
  var costText = $(this).find("p").text();
  $(this).find("p").replaceWith(createCostInput(costText));
  $("input").trigger("focus");
});
/*$(".itinerary-content .cost").on("click", "p", function(event) {
  var costText = $(event.target).text();
  $(event.target).replaceWith(createCostInput(costText));
  $("input").trigger("focus");
});*/
$(".itinerary-content").on("blur", ".cost", function(event) {
  var costText = parseInt($(event.target).val());
  var saveCost = $("<p>")
    .text(costText);
  console.log($(this).parent().children(".saved-place").text());
  for (var i = 0; i < savedItinerary.length; i++) {
    if (savedItinerary[i].item.place == $(this).parent().children(".saved-place").text()) {
      savedItinerary[i].item.cost = costText;
    }
  }
  saveItinerary();
  $(event.target).replaceWith(saveCost);
  autoCalculate();
});


function removeItem(placeName) {
  var placeIndex = savedPlaces.map(obj => obj.place).indexOf(placeName);
  savedPlaces.splice(placeIndex, 1);
  savePlaces();
  $(".initial").html("");
  listItems();
}

// ITINERARY SORTABLE
function dragDropEnable(selectedDate) {
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
      
      update: function(event, ui) {
        if (!ui.sender) {
          for (var i = 0; i < savedItinerary.length; i++) {
            if (savedItinerary[i].item.place == $(ui.item).text() && $(ui.item).parent().hasClass("list-items")) {
              savedItinerary[i].date = selectedDate;
            } else if (savedItinerary[i].item.place == $(ui.item).text() && $(ui.item).parent().hasClass("initial")) {
              savedItinerary[i].date = null;
            }
          }
          console.log(savedItinerary);
          saveItinerary();
        }
        /*if (!ui.sender) {
          //var tempArr = savedPlaces;
          var tempObj = { items: [] };
          for (var i = 0; i < savedPlaces.length; i++) {
            console.log($(this), $(event.target), $(ui.placeholder));
            if (savedPlaces[i].place == $(ui.item).text() && $(ui.item).parent().hasClass("list-items") && !$(ui.placeholder).hasClass("itinerary-place")) {
              console.log($(ui.item).text(), "MATCH!!!");
              console.log(savedItinerary[0].items[i].place);
              console.log(selectedDate);
              var newDate = true;
              for (var a = 0; a < savedItinerary.length; a++) {
                if (savedItinerary[a].date == selectedDate) {
                  newDate = false;
                  savedItinerary[a].items.push(savedPlaces[i]);
                  break;
                }
              }
              if (newDate) {
                tempObj.date = selectedDate;
                tempObj.items.push(savedPlaces[i]);
                savedItinerary.push(tempObj);
                tempObj = { items: [] };
              }
              savedItinerary[0].items.splice(i, 1);
              var tempMove = savedPlaces[i];
              savedPlaces.splice(i, 1);
              savedPlaces.push(tempMove);
              console.log(savedItinerary[0].items, i);
              break;
            }
            else if (savedPlaces[i].place == $(ui.item).text() && $(ui.item).parent().hasClass("initial") && !$(ui.placeholder).hasClass("initial-place")) {
              console.log($(ui.item).text(), "BACK TO ORIGINAL LIST");
              for (var a = 0; a < savedItinerary.length; a++) {
                if (savedItinerary[a].date == null) {
                  savedItinerary[0].items.push(savedPlaces[i]);
                } else if (savedItinerary[a].date == selectedDate) {
                  for (var n = 0; n < savedItinerary[a].items.length; n++) {
                    if (savedItinerary[a].items[n].place == $(ui.item).text()){
                      savedItinerary[a].items.splice(n, 1);
                      console.log(savedItinerary[a].items, n);
                    }
                  }
                }
              }
              console.log(savedItinerary);
              break;
            }
          }
          saveItinerary();
        }*/
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
}


// EDIT BUDGET
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

var zeroDecimal = ["BIF", "CLP", "DJF", "GNF", "ISK", "JPY", "KMF", "KRW", "PYG", "RWF", "UGX", "UYI", "VND", "VUV", "XAF", "XOF", "XPF"];

// Cody's converter code
function convert(currency1, currency2, value) {
  //const host = "api.frankfurter.app";
  var convertURL = "https://api.exchangerate.host/convert?amount=" + value + "&from=" + currency1 + "&to=" + currency2 + "&places=2";
  fetch (
    convertURL
      //'https://' + host + '/latest?amount=' + value + '&from=' + currency1 + '&to=' + currency2
  )
  .then((val) => val.json())
  .then((val) => {
          //console.log(Object.values(val.rates)[0]);
          console.log(val);
          var convertedBudget = val.result;
          for (var i = 0; i < zeroDecimal.length; i++) {
            if (currency2 == zeroDecimal[i]) {
              convertedBudget = Math.round(val.result);
              break;
            }
          }
          $("#local-budget p").text(currencyInfo.destinationSymbol + /*Object.values(val.rates)[0]*/convertedBudget);
          var localConversion = $("<span>")
            .addClass("convert-tag")
            .text("(local conversion)");
          $("#local-budget p").append(localConversion);
      });
}

function convertCosts(currency1, currency2, value, placeName) {
  var convertURL = "https://api.exchangerate.host/convert?amount=" + value + "&from=" + currency1 + "&to=" + currency2 + "&places=2";
  fetch (convertURL)
  .then((val) => val.json())
  .then((val) => {
          console.log(val.result);
          var convertedBudget = val.result;
          for (var i = 0; i < zeroDecimal.length; i++) {
            if (currency2 == zeroDecimal[i]) {
              convertedBudget = Math.round(val.result);
              break;
            }
          }
          for (var i = 0; i < savedItinerary.length; i++) {
            if (savedItinerary[i].item.place == placeName) {
              savedItinerary[i].item.cost = convertedBudget;
              console.log(placeName);
              console.log("item cost", savedItinerary[i].item.cost);
            }
          }
          console.log(savedItinerary);
          saveItinerary();
          listItems();
          autoCalculate();
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
          listItems();
      });
}
getCurrSymbol(settingsInfo.defaultCountry, "default");
getCurrSymbol(currentSearch.country, "destination");
console.log(currentSearch.country);


// AUTO-CALCULATE COSTS FOR THE DAY
function autoCalculate() {
  var dailyTotal = 0;
  $(".cost p").each(function() {
    console.log(parseFloat($(this).text()));
    var itemCost = parseFloat($(this).text());
    if (isNaN(itemCost)) {
      itemCost = 0;
    }
    dailyTotal += itemCost;
  });
  console.log(dailyTotal);
  $(".estimate-box p").text(dailyTotal);
}


// EDIT DATE RANGE
if (!currentSearch.startDate) {
  var startDateInput = $("<input>")
    .addClass("cell small-12 large-auto")
    .attr("type", "text")
    .attr("name", "start")
    .attr("id", "start-date-input");
  var endDateInput = $("<input>")
    .addClass("cell small-12 large-auto")
    .attr("type", "text")
    .attr("name", "end")
    .attr("id", "end-date-input");
  $("#time-frame").find("#start-date-span").replaceWith(startDateInput);
  $("#time-frame").find("#end-date-span").replaceWith(endDateInput);
} else {
  $("#time-frame").find("#start-date-span").text(currentSearch.startDate.split(",")[0]);
  $("#time-frame").find("#end-date-span").text(currentSearch.endDate.split(",")[0]);
}

$("#time-frame").on("click", "#start-date-span", function() {
    var getStartDate = $("#time-frame").find("#start-date-span").text().trim();

    var dateInput = $("<input>")
      .addClass("cell small-12 large-auto")
      .attr("type", "text")
      .attr("name", "start")
      .attr("id", "start-date-input")
      .val(getStartDate);

    $("#time-frame").find("#start-date-span").replaceWith(dateInput);
    dateInput.trigger("focus");
});
$("#time-frame").on("click", "#end-date-span", function() {
    var getEndDate = $("#time-frame").find("#end-date-span").text().trim();

    var dateInput = $("<input>")
      .addClass("cell small-12 large-auto")
      .attr("type", "text")
      .attr("name", "end")
      .attr("id", "end-date-input")
      .val(getEndDate);

    $("#time-frame").find("#end-date-span").replaceWith(dateInput);
    dateInput.trigger("focus");
});

// p, input, div ALL MESSED UP, need to fix!!!

$("#time-frame").on("change", "#start-date-input", function() {
  console.log($("#time-frame").find("#start-date-input").val());
  var startDateText = $("#time-frame").find("#start-date-input").val().trim();

  var displayStartDate = $("<span>")
    .addClass("cell small-12 large-shrink date-to")
    .attr("id", "start-date-span")
    .text(startDateText.split(",")[0]);

  $("#time-frame").find("#start-date-input").replaceWith(displayStartDate);

  currentSearch.startDate = startDateText;
  localStorage.setItem("saved-location", JSON.stringify(currentSearch));

  firstDay = moment(currentSearch.startDate).format("MMMM D");
  displayItinerary(firstDay);
});
$("#time-frame").on("change", "#end-date-input", function() {
  console.log($("#time-frame").find("#end-date-input").val());
  var endDateText = $("#time-frame").find("#end-date-input").val().trim();

  var displayEndDate = $("<span>")
    .addClass("cell small-12 large-shrink date-to")
    .attr("id", "end-date-span")
    .text(endDateText.split(",")[0]);

  $("#time-frame").find("#end-date-input").replaceWith(displayEndDate);

  currentSearch.endDate = endDateText;
  localStorage.setItem("saved-location", JSON.stringify(currentSearch));

  lastDay = moment(currentSearch.endDate).format("MMMM D");
  displayItinerary(firstDay);
});

$("#time-frame").on("focus", "input", function() {
  var dateFormat = "mm/dd/yy",
  from = $("#time-frame").find("#end-date-input").datepicker({
    defaultDate: "+1w",
    changeMonth: true,
    changeYear: true,
    numberOfMonths: 1,
    minDate: 0,
    dateFormat: "MM d, yy"
  })
  .on("change", function() {
    to.datepicker("option", "minDate", getDate(this));
  }),
  to = $("#time-frame").find("#start-date-input").datepicker({
    defaultDate: "+1w",
    changeMonth: true,
    changeYear: true,
    numberOfMonths: 1,
    minDate: 0,
    dateFormat: "MM d, yy"
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
    <input type='radio' name='search-display' id='default' value='0' />\
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

$("input[name='search-display']").each( function() {
  if ($(this).attr("id") == settingsInfo.displayCosts) {
    $(this).prop("checked", true);
  }
});

settingsContentDisplayCost.on("click", "input[name='search-display']", function(event) {
  console.log($(event.target).attr("id"));
  $(event.target).prop("checked", true);
  settingsInfo.displayCosts = $(event.target).attr("id");
  saveSettings();
  console.log(settingsInfo.displayCosts);
  if (settingsInfo.displayCosts == "default") {
    var curr1 = currencyInfo.destinationCurrency;
    var curr2 = currencyInfo.defaultCurrency;
  } else {
    var curr1 = currencyInfo.defaultCurrency;
    var curr2 = currencyInfo.destinationCurrency;
  }
  $(".cost p").each(function() {
    console.log(".COST P EACH", $(this).text());
    console.log(curr1, curr2, $(this).text());
    var placeName = $(this).parent().parent().children(".saved-place").text();
    convertCosts(curr1, curr2, $(this).text(), placeName);
    //console.log($(this).parent().parent().children(".saved-place").text());
  });
});