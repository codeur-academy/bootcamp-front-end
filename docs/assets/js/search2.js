var search_wrap = document.getElementById('search-wrapper'),
searchbar = document.getElementById('searchbar'),
searchbar_outer = document.getElementById('searchbar-outer'),
searchresults = document.getElementById('searchresults'),
searchresults_outer = document.getElementById('searchresults-outer'),
searchresults_header = document.getElementById('searchresults-header'),
searchicon = document.getElementById('search-toggle'),
content = document.getElementById('content'); 
var json_data = null;

function showSearch(yes) {
  if (yes) {
      search_wrap.classList.remove('hidden');
      searchicon.setAttribute('aria-expanded', 'true');
  } else {
      search_wrap.classList.add('hidden');
      searchicon.setAttribute('aria-expanded', 'false');
      var results = searchresults.children;
      for (var i = 0; i < results.length; i++) {
          results[i].classList.remove("focus");
      }
  }
}

function showResults(yes) {
  if (yes) {
      searchresults_outer.classList.remove('hidden');
  } else {
      searchresults_outer.classList.add('hidden');
  }
}

  // Eventhandler for search icon
function searchIconClickHandler() {

    if (search_wrap.classList.contains('hidden')) {
        showSearch(true);
        window.scrollTo(0, 0);
        searchbar.select();
    } else {
        showSearch(false);
    }
}

 
// Set up events
searchicon.addEventListener('click', function(e) { searchIconClickHandler(); }, false);
//searchbar.addEventListener('keyup', function(e) { searchbarKeyUpHandler(); }, false);
// document.addEventListener('keydown', function(e) { globalKeyHandler(e); }, false);


// Load and Search
jQuery(function() {
    // Initialize lunr with the fields to be searched, plus the boost.
    window.idx = lunr(function () {
      this.field('id');
      this.field('title');
      this.field('content', { boost: 10 });
      this.field('author');
      this.field('categories');
    });
    
    var json_url = site_baseurl +  '/search.json';
   

    $.getJSON( json_url,)
  .done(function( data ) {
    console.log(data);
    json_data = data;
    $.each(data, function(index, value){
      window.idx.add(
        $.extend({ "id": index }, value)
      );
    });
  })
  .fail(function( jqxhr, textStatus, error ) {
    var err = textStatus + ", " + error;
    console.log( "Request  Failed: " + err );
    alert("Search Json Request Failed" + err);
});


    
  
    // Event when the form is submitted
    $("#searchbar").on("keyup change copy paste cut",function(){

        var query = $("#searchbar").val(); // Get the value for the text field
        if(query == "") 
        {
          showResults(false);
          return;
        }
        var results = window.idx.search(query); // Get lunr to perform a search
        display_search_results(results); // Hand the results off to be displayed
    });
  
    function mark_keyword() {
        var keyword = $("#searchbar").val();
        var options = {};
        $("#searchresults").unmark({
          done: function() {
            $("#searchresults").mark(keyword, {element: "em"});
          }
        });
      };

    function display_search_results(results) {

      showResults(true);

      var $search_results = $("#searchresults");
  
      // Are there any results?
      if (results.length) {
        $search_results.empty(); // Clear any old results

        // Iterate over the results
        results.forEach(function(result) {
          var item = json_data[result.ref];

          // Build a snippet of HTML for this result
          var appendString = '<li><a href="' + item.url + '">' + item.title + '</a>';
          appendString += '<p>' + item.content.substring(0, 150) + '...</p></li>';
          // Add the snippet to the collection of results.
          $search_results.append(appendString);

          mark_keyword();

        });
      } else {
        // If there are no results, let the user know.
        $search_results.html('<li>No results found.<br/>Please check spelling, spacing, yada...</li>');
      }
    }
  });


 