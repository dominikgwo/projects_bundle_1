 //get tabs in current window
 function getCurrentWindowTabs(callback) {
     chrome.tabs.query({
         currentWindow: true
     }, function(tabs) {
         callback(tabs);
     });
 }

 //get all tabs
 function getAllTabs(callback) {
     chrome.tabs.query({}, function(tabs) {
         callback(tabs);
     });
 }


 //VARIABBLES



 //TIEMPOS DE ALARMA AJUSTADOS POR EL USUARIO
 var hourspop;
 var minutespop;
 var secondspop;




 //FORMATEO  DE TIEMPO
 var timeformatout;


 //INTERVALO para la funcion de comunicación
 var comm;




 //Creamos una comunicacion

 var port = chrome.extension.connect({
     name: "Sample Communication"
 });



 //funcion para esconder y mostrar  un elemento por acción e click  cada vez que se cargue la ventana popup 

 window.addEventListener('load', function load(event) {
     var hideimg = document.getElementById('hide');
     var block = document.getElementById('shortcs');
     hideimg.addEventListener('click', function() {

         if (block.style.display === "none") {
             block.style.display = "block";
         } else {
             block.style.display = "none";
         }



     });
 });



 //funcion listener para restaurar pestañas cerradas para ambos botones restore1 y restore2

 window.addEventListener('load', function load(event) {


     var restore = document.getElementById("restore");
     var restore2 = document.getElementById("restore2");

     if (restore) restore.addEventListener("click", function() {
         if (chrome.sessions) {
             chrome.sessions.getRecentlyClosed(function(e) { //api sessions para encontrar la primera pestaña guardada en la sesion
                 if (e[0].tab) chrome.sessions.restore(e[0].tab.sessionId, function() {});
             });
         }
     });


     if (restore2) restore2.addEventListener("click", function() {
         if (chrome.sessions) {
             chrome.sessions.getRecentlyClosed(function(e) {
                 if (e[0].tab) chrome.sessions.restore(e[0].tab.sessionId, function() {});
             });
         }
     });




 });




 //FUNCION: comunicación con ALARMA
 // guarda las opciones  al chrome.storage
 function save_options() {




     //activa los elementos Reminders ,activables junto a la alarma 
     var reminders = document.getElementsByClassName("reminder");

     for (var i = 0; i < reminders.length; i++) {
         reminders[i].style.display = "inline"; //inline o block establece la forma de mostrarlos
     }




     //guardamos los valores que le hemos dado a nuestra alarma 
     hourspop = document.getElementById('hourspop').value;
     minutespop = document.getElementById('minutespop').value;
     secondspop = document.getElementById('secondspop').value;



     //multiple validación de todos los campos de alarma 
     if (hourspop == "" || minutespop == "" || secondspop == "" || isNaN(hourspop) || isNaN(minutespop) || isNaN(secondspop) || hourspop.length == 1 || secondspop.length == 1 || minutespop.length == 1) {




         alert("Deben de rellenarse bien los campos "); //dialogo si no se cumplen



         document.getElementById('hourspop').readOnly = false;
         document.getElementById('secondspop').readOnly = false;
         document.getElementById('minutespop').readOnly = false;
         window.close();

     }




     document.getElementById('hourspop').readOnly = true;
     document.getElementById('secondspop').readOnly = true;
     document.getElementById('minutespop').readOnly = true;




     //storage . .set para guardar los valores de alarma que hemos aplicado
     chrome.storage.sync.set({
         Hours1: hourspop,
         Minutes1: minutespop,
         Seconds1: secondspop




     });

     ////storage . .gett para recuperar los valores de alarma que hemos aplicado
     chrome.storage.sync.get({
         Hours1: hourspop,
         Minutes1: minutespop,
         Seconds1: secondspop




         //funcion callback para acceder  a los valores que hemos recuperado desde el storage de google
     }, function(items) {
         // Update status to let user know options were saved.


         //Estas son las variables que se enviaran a través de la comunicacion abierta a background.js  con los items guardados del storage 
         var horas_send = items.Hours1;
         var minutes_send = items.Minutes1;
         var seconds_send = items.Seconds1;


         //Formato Digital
         timeformatout = horas_send + ":" + minutes_send + ":" + seconds_send;



         //Enviamos formateado el tiempo a background.js ,background.js tiene un listener y procesará este tiempo para lanzar el evento de alarma 
         port.postMessage(timeformatout);




         //informamos en un timeout escribiendo sobre un elemento visible del HTML 750 msec
         var status = document.getElementById('status');
         status.innerHTML = 'Options saved.';
         setTimeout(function() {
             status.innerHTML = '';
         }, 750);
     });

     //FIN COMUNICACION con ALARMA




 }

 //reseteo contador y reminders
 function clear_options() {


     var reminders = document.getElementsByClassName("reminder"); //obtenemos un array todos los elementos de esa clase

     for (var i = 0; i < reminders.length; i++) {
         reminders[i].style.display = "none"; //los escondemos individualmente 
     }




     //borramos solo-lectura
     document.getElementById('hourspop').readOnly = false;
     document.getElementById('secondspop').readOnly = false;
     document.getElementById('minutespop').readOnly = false;

     //reseteamos el valor 
     document.getElementById("hourspop").value = "00";
     document.getElementById('secondspop').value = "00";
     document.getElementById('minutespop').value = "00";




 }




 //FUNCION vinculada  con options.js /options.html 
 function restore_options() {


     //recuperamos la opcion escogida en el list de options.html 
     chrome.storage.sync.get({
         favoriteColor: 'test',

     }, function(items) {

         document.body.style.background = items.favoriteColor; //aplicamos estilo al background de nuestro popup




     });
 }


 document.addEventListener('DOMContentLoaded', restore_options); //establecemos que cada vez que se el popup restaure la opción elegida 



 //INICIO CONTADOR EN EL POPUP


 comm = setInterval(portcommunication, 1000); //establecemos un intervalo para enviar y recibir  mensajes por el puerto cada 1000 msec con el



 function portcommunication() {



     port.postMessage(timeformatout);
     //nos comunicamos para activar la función listener que reenviará otro mensaje con el tiempo correcto y actualizado	
     port.onMessage.addListener(function(msg) {
         //escuchamos y recibimos el tiempo actualizado (msg)   

         //Escribimos en el HTML	      



         document.getElementById('windowTabs1').innerHTML = '<b>' + lenText1 + '<font size=3 face="sans-serif" color="blue">' + ' Audible Tabs' + '</font>' + '  ' + msg + '</b>';



         //**lentText es un contador de las pestañas audibles		



     });




 }


 //func. para parar la comunicación del tiempo en el popup
 function stopInterval() {


     window.clearInterval(comm);
     clearInterval(comm);
     comm = 0;

 }




 //FUNCIONES MANEJO DEL TIEMPO DEL POPUP CON BOTONES EN LISTENERS

 //--> mirar background.js para detalles

 //resetea el contador
 function clear_cnt() {
     chrome.runtime.sendMessage({
             greeting: "1"
         }

     )
 };


 //pausa el contador
 function pause_tm() {



     chrome.runtime.sendMessage({
             greeting: "2"
         }

     )
 };

 //resume el contador
 function resume_tm() {
     chrome.runtime.sendMessage({
             greeting: "3"
         }

     )
 };




 function displayResults(tabs) {


     //inicializamos objetos con sonido
     var batch_done = new Audio("airhorn.mp3");
     var resume = new Audio("Resume.mp3");
     var pause = new Audio("Pause.mp3");




     //listener y funciones trigger para botones

     document.getElementById('save').addEventListener('click',
         save_options);



     document.getElementById('clear').addEventListener('click',
         clear_options);


     document.getElementById('clearcount').addEventListener('click',
         clear_cnt);


     document.getElementById('pausetime').addEventListener('click',
         pause_tm);

     document.getElementById('resumetime').addEventListener('click',
         resume_tm);

     //Activar reminder
     document.getElementById('alarmOn1').addEventListener('click',
         alarmCreate);

     //Desactivar Reminder
     document.getElementById('alarmOff1').addEventListener('click',
         alarmRemove);




     //obtenemos informacion  de las pestñas , teniendo acceso al objeto tabs de la API

     chrome.tabs.query({}, function(tabs) {




         //contadores
         var audible_count = 0;
         var pinned_count = 0;
         var muted_count = 0;


         //elementos HTML
         //tablas para insertar las filas
         var table = document.getElementById('tabsTable');
         var table1 = document.getElementById('tabsTable1');




         var close1 = document.getElementById('close');
         var close2 = document.getElementById('close2');
         var mute = document.getElementById('muteall');
         var pauseYT = document.getElementById('pause');
         var reloadbutt = document.getElementById('reload');
		 var pinall = document.getElementById('pinall');



         //Describimos los shortcuts
         document.getElementById('shortcs').innerHTML += ' <font face="verdana" color="green"> </font>   <i>Cycle Pinned Tabs </i> <b>Ctrl + Shift + 3  </b><br> <i>Close Pinned Tabs</i>  <b>Ctrl + Shift + 4 </b> <br>  <i>Cycle Audible Tabs </i> <b>Ctrl + Shift + 5</b> <br><i> Close Audible Tabs</i> <b>Ctrl + Shift + 6 </b>';




         //recorremos todas las pestañas de todas las ventanas
         for (var i = 0; i < tabs.length; i++) {




             //SI SON PESTAÑAS PINNED
             if (tabs[i].pinned) {

                 var row = table.insertRow(0); //insertamos una fila  "th"
                 var cell1 = row.insertCell(0); //insertamos las celdas "td"
                 var cell2 = row.insertCell(1);
                 var cell3 = row.insertCell(2);
                 var cell4 = row.insertCell(3);
                 var cell5 = row.insertCell(4);
                 var cell6special = row.insertCell(5); //conflictodeacceso
                 var cell7 = row.insertCell(6);


                 //creamos un elemento de lista para hacer bookmarking de las pestñas individualmene
                 var bookmarkItem = document.createElement('li');
                 var id2 = tabs[i].id;
                 bookmarkItem.id = 'bookmark_item_' + id2;

                 //Definimos las celdas
                 cell1.innerHTML = "<img src=" + tabs[i].favIconUrl + " width='16' height='16'>"; //celda faviconcs
                 cell2.innerHTML = "<span data-toggle='tooltip' title='close tab' style=cursor:pointer><font color=red>X</font> </span>";
                 cell3.innerHTML = "<span style=cursor:pointer title='" + tabs[i].url + "'>" + tabs[i].title + "</span>";
                 cell4.innerHTML = ' <img src="/unpinned.png" alt="unpinned"  style="width:32px;height:18px;cursor:pointer" />';
                 cell5.innerHTML = ' <img src="/duplicated.png" alt="duplicate" style="opacity:0.4;filter:alpha(opacity=40);cursor:pointer"/>';
                 cell6special.appendChild(bookmarkItem); //añadimos un nodo hijo a la celda (el icono)
                 cell7.innerHTML = ' <img src="/copy.png" alt="copy" style="opacity:0.4;filter:alpha(opacity=40);cursor:pointer;width:20px;height:20px;"/>';
                 bookmarkItem.classList.add('bookmarkoff'); //añade la clase para hacer el toggle 
                 bookmarkItem.innerHTML = '<a class="bookmark_item" style="cursor:pointer" ><i class="bookmark"></i></a>'; //añade el icono de bookamark a traves de la clase definida en el css



                 //aumentamos el contador pinned
                 pinned_count += 1;




                 //TOGGLE BOOKMARKS 
                 var toggleBookmarked1 = function(i, li_id, id, c, a) {

                     var bookmarkitem1 = document.getElementById(li_id);
                     var bokmarktoggle1 = bookmarkitem1.classList.toggle('bookmarkoff');

                     setTimeout(function() {
                         var bokmarktoggle1 = bookmarkitem1.classList.toggle('bookmarkoff');
                     }, 750);


                     var a = tabs[i].url;
                     var c = tabs[i].title;




                     BookmarkClicked(c, a);


                     function BookmarkClicked(c, a) { //>---

                         chrome.bookmarks.getChildren('0', function(children) { //seleccionamos  el nodo hijo dentro del arbol de nodos de bookamrks 

                             var bookmark = children[1];

                             createTestBookmark(bookmark[0], c, a); //le pasamos la ubicacion , tab.title(c) y tab.url(a) q se necesitan para crear el bookmark -->




                         })

                     }

                     function createTestBookmark(parentId, title, url) { //>--

                         //buscamos por url si el marcador ya existe 
                         chrome.bookmarks.search(url, function(bmk) {
                             var id = bmk[0];
                             // console.log(bmk[0]); //logueamos informacion del objeto existente
                             if (id == undefined) { //si no existe lo creamos 

                                 var print = document.getElementById('texto');

                                 var textobmk = 'Bookmard Added "Other Bookmarks" Folder ';

                                 //informamos en el Html
                                 print.innerHTML += textobmk;
                                 setTimeout(function() {
                                     print.innerHTML = '';
                                 }, 1750);

                                 //creacion de bookamrk con los parametros >--
                                 chrome.bookmarks.create({
                                         'parentId': parentId,
                                         'title': title,
                                         'url': url
                                     },




                                     function(newBookmark) {

                                         // console.log("added bookmark: " + newBookmark.id); //mostramos al log el id del bookmark único creado


                                     });
                             }

                             //en caso de que ya exista la url buscado lo borramos 
                             else {

                                 var idremove = bmk[0].id; //obtenemos el id

                                 var print = document.getElementById('texto');
                                 var textobookmarkR = 'Bookmark Already Exists... <br> Removing Bookmark  <br> ' + bmk[0].url;
                                 print.innerHTML += textobookmarkR;
                                 bookmarkitem1.setAttribute("style", "background:red;"); //coloreamos el background de la celda temporalmente 
                                 setTimeout(function() {
                                     print.innerHTML = '';
                                     bookmarkitem1.setAttribute("style", "background:none;");


                                 }, 1750);




                                 //Removemos 
                                 chrome.bookmarks.remove(idremove);


                                 //logueamos el id 
                                 // console.log(idremove + 'removed');




                             }
                         });


                     }




                 };



                 //toggle listener para cambiar el estado del icono

                 cell6special.addEventListener("click", toggleBookmarked1.bind(null, i, bookmarkItem.id, id2), false);




                 //funcion para quitar las pestñas en pinned
                 function togglePinnedStatus(tabID) {



                     chrome.tabs.update(tabID, {
                         pinned: false
                     });
                     window.location.reload();

                 }



                 /////////////////////////


                 //cerrar todas las pestaña audibles

                 close1.addEventListener("click", (function(tabID) {
                     return function() {
                         closeTab(tabID);
                     }
                 })(tabs[i].id));




                 //cerrar  una pestaña


                 cell2.addEventListener("click", (function(tabID) {
                     return function() {
                         closeTab(tabID);
                     }
                 })(tabs[i].id));


                 //abir la pestaña desde la fila 
                 cell3.addEventListener("click", (function(tabID, windowID) {
                     return function() {
                         openTab(tabID, windowID);
                     }
                 })(tabs[i].id, tabs[i].windowId));




                 //poner pestaña en pinned

                 cell4.addEventListener("click", (function(tabID) {
                     return function() {
                         togglePinnedStatus(tabID);
                     }
                 })(tabs[i].id));


                 //duplicar pestaña 


                 cell5.addEventListener("click", (function(tabID) {
                     return function() {
                         duplicateTab(tabID);
                     }
                 })(tabs[i].id));

                 //para copiar el título de la pestaña 

                 cell7.addEventListener("click", (function(c) {
                     var a = tabs[i].url;
                     var c = tabs[i].title;




                     return function() {
                         copy(c);

                         var copymsg = document.getElementById('texto');

                         //infroma del texto copiado

                         var text_copy = 'Copy to clibpoard Tab Title :  <br> ' + c;
                         copymsg.innerHTML += text_copy;
                         setTimeout(function() {
                             copymsg.innerHTML = '';


                         }, 1750);




                     }
                 })(tabs[i].id));




             }



             ///SI SON PESTAÑAS AUDIBLES

             if (tabs[i].audible) {

                 var audioItem = document.createElement('li');
                 var id = tabs[i].id;
                 audioItem.id = 'audio_item_' + id;


                 var bookmarkItem = document.createElement('li');
                 var id2 = tabs[i].id;
                 bookmarkItem.id = 'bookmark_item_' + id2; //

                 var row = table1.insertRow(0); //filas
                 var cell1 = row.insertCell(0); //celdas
                 var cell2 = row.insertCell(1);
                 var cell3 = row.insertCell(2);
                 var cell4 = row.insertCell(3);
                 var cell5 = row.insertCell(4);
                 var cell6 = row.insertCell(5);
                 var cell7 = row.insertCell(6);
                 var cell8 = row.insertCell(7);
                 var cell9 = row.insertCell(8);




                 //Definición de las celdas
                 cell1.innerHTML = "<img src=" + tabs[i].favIconUrl + " width='16' height='16'>";
                 cell2.innerHTML = "<span data-toggle='tooltip' title='close tab' style=cursor:pointer><font color=red>X</font></span>";
                 cell3.innerHTML = "<span style=cursor:pointer title='" + tabs[i].url + "'>" + tabs[i].title + "</span>";

                 cell5.innerHTML = ' <img src="/pinned.png" alt="pinned" style="width:32px;height:18px;cursor:pointer" />';

                 cell6.innerHTML = ' <img src="/duplicated.png" alt="duplicate" style="opacity:0.4;filter:alpha(opacity=40);cursor:pointer"/>';
                 cell9.innerHTML = ' <img src="/copy.png" alt="copy" style="opacity:0.4;filter:alpha(opacity=40);cursor:pointer;width:20px;height:20px;"/>';


                 bookmarkItem.classList.add('bookmarkoff');
                 bookmarkItem.innerHTML = '<a class="bookmark_item" style="cursor:pointer"><i class="bookmark"></i></a>';
                 cell7.appendChild(bookmarkItem);

                 audible_count += 1; //contamos las audibles 					   							




                 //TOGGLE BOOKMARKS 
                 var toggleBookmarked1 = function(i, li_id, id, c, a) {

                     var bookmarkitem1 = document.getElementById(li_id);
                     var bokmarktoggle1 = bookmarkitem1.classList.toggle('bookmarkoff');

                     setTimeout(function() {
                         var bokmarktoggle1 = bookmarkitem1.classList.toggle('bookmarkoff');
                     }, 750);


                     var a = tabs[i].url;
                     var c = tabs[i].title;




                     BookmarkClicked(c, a);


                     function BookmarkClicked(c, a) { //>---

                         chrome.bookmarks.getChildren('0', function(children) { //seleccionamos  el nodo hijo dentro del arbol de nodos de bookamrks 

                             var bookmark = children[1];

                             createTestBookmark(bookmark[0], c, a); //le pasamos la ubicacion , tab.title(c) y tab.url(a) q se necesitan para crear el bookmark -->




                         })

                     }

                     function createTestBookmark(parentId, title, url) { //>--

                         //buscamos por url si el marcador ya existe 
                         chrome.bookmarks.search(url, function(bmk) {
                             var id = bmk[0];
                             // console.log(bmk[0]); //logueamos informacion del objeto existente
                             if (id == undefined) { //si no existe lo creamos 

                                 var print = document.getElementById('texto1');

                                 var textobmk = 'Bookmard Added "Other Bookmarks" Folder ';

                                 //informamos en el Html
                                 print.innerHTML += textobmk;
                                 setTimeout(function() {
                                     print.innerHTML = '';
                                 }, 1750);

                                 //creacion de bookamrk con los parametros >--
                                 chrome.bookmarks.create({
                                         'parentId': parentId,
                                         'title': title,
                                         'url': url
                                     },




                                     function(newBookmark) {

                                         // console.log("added bookmark: " + newBookmark.id); //mostramos al log el id del bookmark único creado


                                     });
                             }

                             //en caso de que ya exista la url buscado lo borramos 
                             else {

                                 var idremove = bmk[0].id; //obtenemos el id

                                 var print = document.getElementById('texto1');
                                 var textobookmarkR = 'Bookmark Already Exists... <br> Removing Bookmark  <br> ' + bmk[0].url;
                                 print.innerHTML += textobookmarkR;
                                 bookmarkitem1.setAttribute("style", "background:red;"); //coloreamos el background de la celda temporalmente 
                                 setTimeout(function() {
                                     print.innerHTML = '';
                                     bookmarkitem1.setAttribute("style", "background:none;");


                                 }, 1750);




                                 //Removemos 
                                 chrome.bookmarks.remove(idremove);


                                 //logueamos el id 
                                 // console.log(idremove + 'removed');




                             }
                         });


                     }




                 };


                 cell7.addEventListener("click", toggleBookmarked1.bind(null, i, bookmarkItem.id, id2), false);


                 //FUNCIONES 

                 function copyTab(c) {



                 }

                 //funcion para copiar
                 function copy(s) { //se utiliza un elemento  HTML para copiar  para poder ejecutar el la funcion de seleccion y el comando de copiado 
                     var o = document.getElementById("njrz");
                     if (o) {
                         o.value = s;
                         o.select();
                         document.execCommand("copy", false, null)
                     }
                 }


                 function copyPageTitle(info, tab) {
                     if (tab.title) {
                         copy(tab.title)
                     }
                 } //se pasan los parametros 




                 //funcion para reproducir los sonidos incializados

                 function play_batch_sound() {
                     batch_done.play();
                 }

                 //Voces en  TTS

                 function play_resume_sound() {
                     resume.play();
                 }

                 function play_pause_sound() {
                     pause.play();
                 }



                 //para pausar videos en youtube 

                 function pauseVideo(tabs) {

                     //obtenemos informacion de las tabs 
                     var querying = chrome.tabs.query({}, function(tabs) {
                         for (var i = 0; i < tabs.length; i++) {

                             if (tabs[i].audible) {



                                 play_pause_sound();
                                 chrome.tabs.executeScript(tabs[i].id, {
                                     "file": "pauseScript.js"
                                 }, function() {}); //ejecutamos un script externo 


                             }


                             if (!tabs[i].audible) {



                             }
                             //no funciona 

                         }
                     });
                 }




                 //DEFINICION DE LA NOTIFICACIOB
                 function createNot1(tabId, windowId, title) {

                     play_batch_sound(); //sonido

                     var options = { //parámetros 
                         type: 'image',
                         iconUrl: 'images/notification-icon.png',
                         title: 'You have more than 2 Tabs playing',
                         message: '!',
                         eventTime: Date.now(),
                         imageUrl: 'images/notification-icon.png',
                         priority: 0 //max p
                     };

                     var msj = chrome.notifications.create('id' + tabId, options);
                     chrome.notifications.create('id' + tabId, options, function(msj) {
                         setTimeout(function() {
                             chrome.notifications.clear(msj);
                         }, 2000);
                     });



                 }




                 //para poner pestaña  en pinned 

                 function togglePinnedStatus1(tabID) {



                     chrome.tabs.update(tabID, {
                         pinned: true
                     });
                     window.location.reload();

                 }




                 if (tabs[i].mutedInfo.muted) { //uso unos metodos para conocer si las pestañas estan muteadas y asi poner actualizar el estado del icono sobre la carga del popup

                     audioItem.classList.add('muted'); //añado la clase muted que contiene el nuevo icono para pestañas muted desde css
                     audioItem.innerHTML = '<a class="audio_item" style="cursor:pointer"><i class="audio"></i></a>'; //añadirmos clases y efectos
                     cell4.appendChild(audioItem); //añadimos como hijo al elemento celda de HTML 
                     muted_count += 1;


                 } else {


                     audioItem.innerHTML = '<a class="audio_item" style="cursor:pointer"><i class="audio"></i></a>'; //en este caso no añadimos la clase muted y se muestra el icono normal


                     cell4.appendChild(audioItem);



                 }




                 if (audible_count >= 2 && !muted_count > 0) { //saldrá la notificacion si hay 2 o más pestañas audibles pero siempre que ninguna este muteada

                     createNot1(tabs[i], tabs.windowId, tabs.title);


                 }


                 // }




                 //controla el estado muted de las pestañas y actualiza el icono acorde al estado de la clase en estilos
                 var toggleMuted = function(i, li_id, id) {

                     var mutable = document.getElementById(li_id);



                     var muted = mutable.classList.toggle('muted');

                     if (muted) {
                         chrome.tabs.update(id, {
                             muted: true
                         }, function() {});
                         mutable.classList.add('muted')
                     } else {
                         chrome.tabs.update(id, {
                             muted: false
                         }, function() {});
                         mutable.classList.remove('muted')
                     }




                 };




                 //LISTENERS



                 //listener para cerrar pestaña 

                 cell2.addEventListener("click", (function(tabID) {
                     return function() {
                         closeTab(tabID);
                     }
                 })(tabs[i].id));


                 //listener para copiar el título de la pestaña 
                 cell9.addEventListener("click", (function(k) {
                     // var a = tabs[i].url;
                     var k = tabs[i].title;




                     return function() {
                         copy(k);

                         //informamos 
                         var copymsg = document.getElementById('texto1');

                         var text_copy = 'Copy to clibpoard Tab Title :  <br> ' + k;
                         copymsg.innerHTML += text_copy;
                         setTimeout(function() {
                             copymsg.innerHTML = '';

                         }, 1750);




                     }
                 })(tabs[i].id));




                 //listener para pausar los videos de youtube ,script externo 

                 pauseYT.addEventListener("click", (function(tabID) {
                     return function() {
                         pauseVideo(tabID);
                     }
                 })(tabs[i].id));



                 //listener para hacer un relod en caso de que se atasque el popup
                 reloadbutt.addEventListener("click", (function() {
                     return function() {
                         reloadtab();
                     }
                 })(tabs[i].id));




                 //listener para abrir la pestaña 
                 cell3.addEventListener("click", (function(tabID, windowID) {
                     return function() {
                         openTab(tabID, windowID);
                     }
                 })(tabs[i].id, tabs[i].windowId));


                 //listener para poner en pinned
                 cell5.addEventListener("click", (function(tabID) {
                     return function() {


                         togglePinnedStatus1(tabID);
                     }
                 })(tabs[i].id));




                 //listener para duplciar
                 cell6.addEventListener("click", (function(tabID) {
                     return function() {
                         duplicateTab(tabID);
                     }
                 })(tabs[i].id));


                 //listener toggle de audioItem
                 cell4.addEventListener("click", toggleMuted.bind(null, i, audioItem.id, id), false); //this




//listener para cerrar todas las pestañas
                 close2.addEventListener("click", (function(tabID) {
                     return function() {
                         closeTab(tabID);



                     }
                 })(tabs[i].id));


                 //listener para mutar todas las pestañas						
                 mute.addEventListener("click", (function(tabID) {
                     return function() {
                         muteTab(tabID);



                     }
                 })(tabs[i].id));
				 
				  //listener para pinnear todas las pestañas						
                 pinall.addEventListener("click", (function(tabID) {
                     return function() {
                         pinTab(tabID);



                     }
                 })(tabs[i].id));




             }


             if (tabs[i].audible && tabs[i].pinned) { //si la pestaña es audible y es también pinned removemos el celda(4) que tiene el disparador para hacer una pestaña en pinned


                 row.deleteCell(4);


             }




         }




         //contador total
         var total_c = pinned_count + audible_count;


         setBadgeText();



         //pintamos el total de pestañas pinned y audible en la insignia de browser-action
         function setBadgeText() {
             chrome.browserAction.setBadgeText({
                 "text": total_c.toString()
             });
         }




         lenText = pinned_count; //contador pinned
         lenText1 = audible_count; //contador audible 
         document.getElementById('windowTabs').innerHTML += '<b>' + lenText + '<font size=3 face="sans-serif" color="blue">' + ' Pinned Tabs' + '</font>' + '</b>'; //pintamos los contadores en los elementos Html 
         document.getElementById('windowTabs1').innerHTML += '<b>' + lenText1 + '<font size=3 face="sans-serif" color="blue">' + ' Audible Tabs' + '</font>' + '</b>';




     });




 }


 //abrir la pestaña de la celda seleccionada 

 function openTab(tabID, windowID) {
     chrome.windows.update(windowID, {
         focused: true
     });
     chrome.tabs.update(tabID, {
         active: true
     });
 }


 //recargar popup
 function reloadtab() {
     window.location.reload();
 }




 //cerrar todas las pestañas
 function closeTab(tabID) {
     chrome.tabs.remove(tabID);
     window.location.reload();
 }

 //mutar todas las pestañas
 function muteTab(tabID) {

     //info tabs
     var querying = chrome.tabs.query({}, function(tabs) {
         for (var i = 0; i < tabs.length; i++) {

             if (tabs[i].audible) {


                 if (tabs[i].mutedInfo.muted) {

                     chrome.tabs.update(tabID, {
                         muted: false
                     }, function() {});
                     window.location.reload();




                 } else {



                     chrome.tabs.update(tabID, {
                         muted: true
                     }, function() {});
                     window.location.reload();


                 }




             }

         }
     });




 }
 
 
 //pinnear todas las pestañas
 function pinTab(tabID) {

     //info tabs
     var querying = chrome.tabs.query({}, function(tabs) {
         for (var i = 0; i < tabs.length; i++) {

             if (!tabs[i].pinned) {


                chrome.tabs.update(tabID, {
                         pinned: true
                     });
                     window.location.reload();



             }

         }
     });




 }



 //para duplicar
 function duplicateTab(tabID) {
     chrome.tabs.duplicate(tabID);
     window.location.reload();

 }




 //crear la alarma 
 function alarmCreate() {
     var delayvalue = parseFloat(document.getElementById('delay').value);
     // chrome.alarms.create("myAlarm", {delayInMinutes: 0.1, periodInMinutes: 0.2} );
     chrome.alarms.create("myAlarm", {
         delayInMinutes: delayvalue,
         periodInMinutes: delayvalue
     });


 }

 //quitarla 
 function alarmRemove() {
     chrome.alarms.clear("myAlarm");

 }




 //OBTIENe informacion de las ventanas y pestañas
 var tabsDisplayOption = localStorage["popupDisplayOption"];
 if (typeof tabsDisplayOption == "undefined" || tabsDisplayOption == "currentWindow") {
     getCurrentWindowTabs(displayResults);
 } else {
     getAllTabs(displayResults);
 }




 //EXTRAS //chrome.storage.local.clear(); chrome.storage.sync.clear();