function pageInit()
{
    console.log("running pageInit");
}


function pageReady()
{
    console.log("running pageReady");

    //var button = document.getElementById("search_button");
    //button.addEventListener("click", SearchCity.bind(null) );
}


window.onload = pageInit;
jQuery(document).ready(pageReady);
