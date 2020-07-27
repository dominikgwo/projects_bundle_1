//Play the video
var actualCode = 'document.getElementById("movie_player").playVideo();';
var script = document.createElement('script');
script.textContent = actualCode;
(document.head||document.documentElement).appendChild(script);
script.parentNode.removeChild(script);