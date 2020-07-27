
$(document).ready(function () {
    $("#query-field").focus(); 


    chrome.tabs.executeScript( {
        code: "window.getSelection().toString();"
    }, function(selection) {
        $("#query-field").val(selection[0]);
        search();
    });

    $("#form").submit(function() {
      search();
      return false;
    });
});


function search(){
  $("#container").html(''); 
  var query = $("#query-field").val(); 
  query = query.replace(/\s{2,}/g, ' ').trim(); 

  if (query && query!==' ') { 


     var newURL = "https://giphy.com/search/" + encodeURIComponent(query); //
    chrome.tabs.create({ url: newURL });

	
	

  }
  else{
    $("#container").html('<div id="usage-tip" style="display: block;">Tip: Select text on any webpage, then click the Giphy button to view the gifs corresponding to  your selection.</div>');
    $("#container").append('<div><a id="udlnk" href="http://www.giphy.com/" target="_blank">giphy.com</a></div>');

  }

};


