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

// calendar 
$(".list-group").on("click", "span", function() {
 
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
});

// Local Storage
var savedPlaces = [];
if ("saved-places" in localStorage) {
  savedPlaces = JSON.parse(localStorage.getItem("saved-places"));
}

//var dummydata = [{place:"place name"},{place:"place name 2"},{place:"place name 3"}];
for (var i = 0; i < savedPlaces.length; i++) {
  var dataName = savedPlaces[i].place;
  var sortdiv = $("<div>").text(dataName).addClass("saved-place");

  var editButton = $("<span>").addClass("edit-place").html("<i class=\"fas fa-pencil-alt\"></i>");

  sortdiv.append(editButton);
  $(".initial").append(sortdiv);
}

// sortable 
$(".sortable").sortable({
    // enable dragging across lists
    connectWith: $(".sortable"),
    scroll: false,
    tolerance: "pointer",
    helper: "clone"/*,
    
    update:function() {
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
      saveTasks();
    },
    stop: function(event) {
      $(this).removeClass("dropover");
    }*/
  });


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