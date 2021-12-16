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

// sortable function
$( function() {
    $( "#sortable" ).sortable();
  } );
$(".card .list-group").sortable({
    // enable dragging across lists
    connectWith: $(".card .list-group"),
    scroll: false,
    tolerance: "pointer",
    helper: "clone",
    activate: function(event, ui) {
      $(this).addClass("dropover");
      $(".bottom-trash").addClass("bottom-trash-drag");
    },
    deactivate: function(event, ui) {
      $(this).removeClass("dropover");
      $(".bottom-trash").removeClass("bottom-trash-drag");
    },
    over: function(event) {
      $(event.target).addClass("dropover-active");
    },
    out: function(event) {
      $(event.target).removeClass("dropover-active");
    },
    update: function() {
      var tempArr = [];
  
      // loop over current set of children in sortable list
      $(this)
        .children()
        .each(function() {
          // save values in temp array
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
  
      // trim down list's ID to match object property
      var arrName = $(this)
        .attr("id")
        .replace("list-", "");
  
      // update array on tasks object and save
      tasks[arrName] = tempArr;
      saveTasks();
    },
    stop: function(event) {
      $(this).removeClass("dropover");
    }
  });
