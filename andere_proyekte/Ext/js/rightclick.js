
function getword(info,tab) {
  chrome.tabs.create({  
    url: "https://giphy.com/search/" + encodeURIComponent(info.selectionText),
  });           
}

chrome.contextMenus.removeAll(function() {
	chrome.contextMenus.create({
	  title: "Search Giphy for '%s'", 
	  id: "urbansearch",
	  contexts:["selection"], 
	  onclick: getword,
	});
})
