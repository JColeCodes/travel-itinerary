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

var dummydata = [{place:"place name"},{place:"place name 2"},{place:"place name 3"}];
for (var i=0;i<dummydata.length;i++){
  var name = dummydata[i];
  var sortdiv = $("<div>").text(name);
  $(".initial").append(sortdiv);
}

// sortable 
$(".sortable").sortable({
    // enable dragging across lists
    connectWith: $(".sortable"),
    scroll: false,
    tolerance: "pointer",
    helper: "clone",
    
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
    }
  });
