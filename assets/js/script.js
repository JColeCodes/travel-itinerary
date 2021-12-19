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

// SAVE ITINERARY
var savedItinerary = [];

//var dummydata = [{place:"place name"},{place:"place name 2"},{place:"place name 3"}];
for (var i = 0; i < savedPlaces.length; i++) {
  var dataName = savedPlaces[i].place;
  var fullSortable = $("<div>")
    .addClass("grid-x hide-time-cost initial-place");
  var timeDiv = $("<div>")
    .addClass("time cell small-2");
  var costDiv = $("<div>")
    .addClass("cost cell small-2");
  var sortdiv = $("<div>").text(dataName).addClass("saved-place cell auto");

  var editButton = $("<span>").addClass("edit-place").html("<i class=\"fas fa-pencil-alt\"></i>");

  sortdiv.append(editButton);
  fullSortable
    .append(timeDiv)
    .append(sortdiv)
    .append(costDiv);
  $(".initial").append(fullSortable);
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
if (!currentSearch.budget) {
  var inputBudget = $("<input>")
    .attr("type", "number")
    .attr("min", 1)
    .attr("name", "budget");
  $("#current-budget").find("p").replaceWith(inputBudget);
} else {
  $("#current-budget").find("p").text("$" + currentSearch.budget);
}

$("#current-budget").on("click", "p", function() {
    var getNum = $("#current-budget").find("p").text().trim();

    console.log(getNum);

    var currentBudgetNum = getNum.replace("$", "");

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
    .text("$" + textBudgetNum);
  
  $("#current-budget").find("input").replaceWith(displayBudget);

  currentSearch.budget = textBudgetNum;
  localStorage.setItem("saved-location", JSON.stringify(currentSearch));
});


// EDIT DATE RANGE
if (!currentSearch.startDate) {
  var dateInput = $("<div>")
    .addClass("grid-x")
    .html("<input type='text' name='start' id='start-date' class='cell small-12 large-auto' />\
    <p class='cell shrink date-to'>to</p> \
    <input type='text' name='end' id='end-date' class='cell small-12 large-auto' />");
  $("#time-frame").find("p").replaceWith(dateInput);
} else {
  $("#time-frame").find("p").text(currentSearch.dates.start + " to " + currentSearch.dates.end);
}

$("#time-frame").on("change", "#end", function() {
  var dateFormat = "MM d";
  //$(this).datepicker();
  from = $("end").datepicker({
    defaultDate: "+1w",
    changeMonth: true,
    numberOfMonths: 3
  })
  .on("change", function() {
    to.datepicker("option", "minDate", getDate(this));
  }),
  to = $("#start").datepicker({
    defaultDate: "+1w",
    changeMonth: true,
    numberOfMonths: 3
  })
  .on("change", function() {
    from.datepicker("option", "maxDate", getDate(this))
  });
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
                countryList.append(option);
          }
      });
}
listCountries();

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
