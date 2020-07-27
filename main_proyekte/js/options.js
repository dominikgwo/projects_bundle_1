
		// guarda opciones al chrome.storage
function save_options() {
  var color = document.getElementById('color').value;
  chrome.storage.sync.set({
    favoriteColor: color
  }, function() {
 
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}


document.getElementById('save').addEventListener('click',
    save_options);
		
		
