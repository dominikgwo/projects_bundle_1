
		
		
		
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

//listener para hacer algo cuando se detecta que se ha creado una pestaña 
chrome.tabs.onCreated.addListener(function() {

    displayResults();

});

//listener ""
chrome.tabs.onRemoved.addListener(function() {

    displayResults();




});

//listener para cuando estan en foco

chrome.tabs.onActivated.addListener(function() {

    displayResults();
});


//trigger de alarma desde popup.js 

chrome.alarms.onAlarm.addListener(function(alarm) {
    alert("Dialogo Modal Alarma Beep");
});


//crea un objeto para contador

var contador = {};



//definimos loa tributos del objeto 

contador.segundos = 0;
contador.minutos = 0;
contador.horas = 0;


//definimos una variable que establece un formator para el contador y que será enviado con la api dem nesajeria al popup.msg 


//FORMATO 1
var timeformat = contador.horas + ":" + contador.minutos + ":" + contador.segundos;




//OTRAS VARIABLES
var x; //interval
var i;




//Arreglamos formato 00 de 2 dígitos 
contador.minutos = "0" + contador.minutos;
contador.horas = "0" + contador.horas;



//mensaje de entrada 
var msg;

var hourspop;
var timeformatout;


//INICIO LISTENER
//listener para mensajes mensajes enviados desde popup
chrome.extension.onConnect.addListener(function(port) {

    port.onMessage.addListener(function(msg) {


        //enviamos el contador formateado a popup.js
        port.postMessage(timeformat);



        //el mensaje recibido de popup.js lo pasamos a una variable global para su uso en background.js ,contiene el tiempo formateado para la alarma 
        timeformatout = msg;



        //almacenamos el tiempo de alarma de popup.js  en el alamacenamiento local de Chrome 

        chrome.storage.sync.set({
            Time0: timeformatout


        });




    });
})
//FIN LISTENER




//array de textos
var myArray = ["No te alargues más", "Ya es la hora", "Terminando..", "Alarma", "Adios", "alarma2"];


//aleatorización de textos para uso en la notificación de la alarma 
function random() {


    var rand = myArray[Math.floor(Math.random() * myArray.length)];


    return rand; //retornamos un texto random del array
}




//Establecemos una función interna de intervalo , lo q nos permite que cierta función definida sea ejecuta cada X tiempo 

setInterval(displayResults, 1000); //100 msec ,1 seg




function displayResults(tabs) { //RENOMBRAR


    //FUNCION q inicializa el contador 
    function startContador() {




        stopContador(); //llamamos una funcion que para el intervalo para resolver un conflicto de generación de varios intervalos 




        //CONTADOR con fixes "0" + 0					  
        contador.segundos++;
        if (contador.segundos < 10) {
            contador.segundos = "0" + contador.segundos
        }



        if (contador.segundos == 59) {
            contador.segundos = -1;
            contador.segundos = "0" + 0;
            contador.minutos + 1;
        }
        if (contador.segundos == 0) {
            contador.minutos++;
            if (contador.minutos < 10) {
                contador.minutos = "0" + contador.minutos
            }

        }

        if (contador.minutos == 59) {
            contador.minutos = -1;
            contador.horas + 1;

        }
        if ((contador.segundos == 0) && (contador.minutos == 0)) {
            contador.horas++;
            if (contador.horas < 10) {
                contador.horas = "0" + contador.horas
            }
        }




        showTime();


        //establecemos un intervalo para la función de contador para que cada 100msec o 1 seg se sumen las cantidades simuladas.
        x = setInterval(startContador, 1000);

    }

    //FIN FUNCION CONTADOR



    //funcion para parar los intervalos y timeOUts
    function stopContador() {


        clearInterval(x);
        window.clearInterval(x);
        x = 0; //redeclaramos 

       



    }



    //FUNCION para específicar el tooltip para cuando hacemos hover sobre el browser-action

    function showTime() {




        //Formateamos el tiempo 
        timeformat = contador.horas + ":" + contador.minutos + ":" + contador.segundos;




        //hover + tiempo 
        chrome.browserAction.setTitle({
            title: 'Total Playing Time of Audible Tabs : ' + timeformat

        });




        //TRIGGER de ALARMA 


        //recuperamos con sync.get la variable alamacenada previamente con ...sync.set, esta era la variable que contenia el tiempo de alarma del exterior , especificamente de popup.js 
        chrome.storage.sync.get({
            Time0: timeformatout

            //todas la variables guardeadas con chrome storage se guardan en un objeto , las cuales podemos manipular con una función callback.
        }, function(items) {

            //aqui decimos si el tiempo de alarma configurado en popup.js es igual al tiempo de contador que esta ejecutandose en background , entonces activamos la alarma 
            if (items.Time0 == timeformat) {

                chrome.tabs.query({}, function(tabs) { //obtenemso informacion de todas las pestañas abiertas


                    //creamos una notificacion para hacer entender que es una alarma 
                    function createNot1(tabId, windowId, title) {



                        //sonido de alarma 
                        var batch_done = new Audio("airhorn.mp3");
                        play_batch_sound();

                        function play_batch_sound() {
                            batch_done.play();
                        }



                        //cerramos las pestañas cuando ocurra el evento 
                        close_tabs_audible();
                        //creamos una pestaña nueva
                        create_newtab();




                        //OPCIONES paramétricas de notificación

                        var options = {
                            type: 'image',
                            iconUrl: 'images/giphy.gif',
                            title: random(), //le doy un texto aleatorio como título 
                            message: '!!!',
                            eventTime: Date.now(),
                            imageUrl: 'images/notification-icon.png',
                            priority: 0 //max priority
                        };


                        //CREACIÓN de NOTIFICACIOn

                        var msj = chrome.notifications.create('id' + tabId, options);
                        chrome.notifications.create('id' + tabId, options, function(msj) {
                            setTimeout(function() {
                                chrome.notifications.clear(msj); //Establecemos tiempo que se muestral a notificación  2 seg
                            }, 2000);
                        });



                    }


					//--------
                    createNot1(tabs[i], tabs.windowId, tabs.title);


                })

            }
        });



    }


    //2º TIPO DE LISTENER para acciones de contador (BOTONES)

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

        //si recibe mensaje "x" de popup.msj resetea el counter a 0
        if (request.greeting === "1") {

            clear_counter();

        }

        //"" pausa el counter
        if (request.greeting === "2") {

            pause_time();

        }

        //"" lo resume..
        if (request.greeting === "3") {

            resume_time();

        }

    });




    function clear_counter() {


        // lo reseteamos con el formato de 2 dígitos 

        contador.minutos = "0" + 0;
        contador.horas = "0" + 0;

        contador.segundos = "0" + 0;



    }



    function pause_time() {



        // paralizamos nuestro objeto ,todas sus propiedades y funciones con freeze


        Object.freeze(contador);



    }


    function resume_time() {
        //desafortunadamente no tenemos unfreeze asi que tenemos que clonar el objeto sobre la misma variable.

        contador = JSON.parse(JSON.stringify(contador)); // Clona el objeto y remueve la inmutabilidad




    }




    //CONTADORES Acumuladores

    var audible_count = 0;
    var pinned_count = 0




    //chrome.tabs.query({currentWindow:true || false}, function(tabs) { only query on current window not on all

    chrome.tabs.query({}, function(tabs) { //query tabs info on all



        //recorremos los objetos con  informacion de pestañas
        for (i = 0; i < tabs.length; i++) {




            //si la pestaña "x" tiene el atributo pinned

            if (tabs[i].pinned) {


                //acumulamos
                pinned_count += 1;

            }


            //si atr. audible (con sonido)
            if (tabs[i].audible) {




                audible_count += 1;

                //establecemos condicion de que si hay 2 pestañas audible  cambiamos el color de la insignia/chapa de browser action
                if (audible_count >= 2) {


                    chrome.browserAction.setBadgeBackgroundColor({
                        color: "#F00"
                    })




                }

                //si menos de 2..
                if (audible_count < 2) {


                    chrome.browserAction.setBadgeBackgroundColor({
                        color: "#00F"
                    })




                }




            }



        }




        //si mas de 0 ..

        if (audible_count > 0) {
     


                startContador(); /****inicializamos el contador en background******/


    

        }



        //si 0 auible 
        if (audible_count == 0) {

            stopContador(); /****paramos el contador en background******/




        }




        //contador total de pestñas pinned y audible 

        var total_c = pinned_count + audible_count;




        //si el total es 1 cambiamos el texto de la insignia de browser action con setBadgeText
        if (total_c == 1) {
            setBadgeText();

            function setBadgeText() {
                chrome.browserAction.setBadgeText({
                    "text": total_c.toString() + " Tab"
                });
            }



        }
        //si + de 1
        if (total_c > 1) {
            setBadgeText();

            function setBadgeText() {
                chrome.browserAction.setBadgeText({
                    "text": total_c.toString() + " Tabs"
                });
            }


        }
        // si 0
        if (total_c == 0) {
            setBadgeText();

            function setBadgeText() {
                chrome.browserAction.setBadgeText({
                    "text": " 0"
                });
            }


            chrome.browserAction.setBadgeBackgroundColor({
                color: "#000"
            })


        }




    });


}





	
	


















var tabsDisplayOption = localStorage["popupDisplayOption"];
if (typeof tabsDisplayOption == "undefined" || tabsDisplayOption == "currentWindow") {
  getCurrentWindowTabs(displayResults);

} else {
  getAllTabs(displayResults);

}

function create_newtab()
{

chrome.tabs.create({}, function(){}); 


// chrome.tabs.create(object createProperties, function callback)
 // The first argument is not optional, so you should not call the
// function without arguments so we give an empty object



}

function goto_tab_pinned()
{
	var possibles = [];

	chrome.windows.getLastFocused(function(win)
	{
		var first_pinned = false;
		var current_tab = false;

		chrome.tabs.query({}, function(tabs)
		{
			for(var i=0; i<tabs.length; i++)
			{
				if(tabs[i].pinned)
				{
					if(tabs[i].active && tabs[i].windowId == win.id)
					{
						current_tab = tabs[i];
						break;
					}
				}
			}

			for(var i=0; i<tabs.length; i++)
			{
				if(tabs[i].pinned)
				{
					if(tabs[i] !== current_tab)
					{
						possibles.push(tabs[i]);
					}
				}
			}

			if(possibles.length)
			{
				var wins = {};
				var current_win = possibles[0].windowId;
				wins[current_win] = [];

				for(var i=0; i<possibles.length; i++)
				{
					if(possibles[i].windowId !== current_win)
					{
						current_win = possibles[i].windowId;
						wins[current_win] = [];
					}

					wins[current_win].push(possibles[i]);							
				}

				if(wins[win.id] === undefined)
				{
					wins[win.id] = [];
				}

				var keys = Object.keys(wins).sort();

				if(keys[0] !== String(win.id))
				{
					var ind = keys.indexOf(String(win.id));
					var tail = keys.slice(ind + 1);
					keys.splice(ind);
					var winids = [String(win.id)].concat(tail).concat(keys);
				}

				else
				{
					var winids = keys;
				}

				for(var i=0; i<winids.length; i++)
				{
					for(var j=0; j<wins[winids[i]].length; j++)
					{
						var tab = wins[winids[i]][j];

						if(current_tab)
						{
							if(tab.windowId === current_tab.windowId)
							{
								if(tab.index > current_tab.index)
								{
									chrome.tabs.update(tab.id, {active: true});
									chrome.windows.update(tab.windowId, {focused: true});
									return;
								}
							}
							else
							{
								chrome.tabs.update(tab.id, {active: true});
								chrome.windows.update(tab.windowId, {focused: true});
								return;
							}
						}

						else
						{
							chrome.tabs.update(tab.id, {active: true});
							chrome.windows.update(tab.windowId, {focused: true});
							return;
						}
					}
				}

				chrome.tabs.update(possibles[0].id, {active: true});
				chrome.windows.update(possibles[0].windowId, {focused: true});
				return;
			}

			else
			{
				if(current_tab.pinned)
				{
					chrome.tabs.update(current_tab.id, {active: true});
					chrome.windows.update(current_tab.windowId, {focused: true});
					return;
				}
			}
		});
	});
}


function goto_tab_audible()
{
	var possibles = [];

	chrome.windows.getLastFocused(function(win)
	{
		var first_audible = false;
		var current_tab = false;

		chrome.tabs.query({}, function(tabs)
		{
			for(var i=0; i<tabs.length; i++)
			{
				if(tabs[i].audible)
				{
					if(tabs[i].active && tabs[i].windowId == win.id)
					{
						current_tab = tabs[i];
						break;
					}
				}
			}

			for(var i=0; i<tabs.length; i++)
			{
				if(tabs[i].audible)
				{
					if(tabs[i] !== current_tab)
					{
						possibles.push(tabs[i]);
					}
				}
			}

			if(possibles.length)
			{
				var wins = {};
				var current_win = possibles[0].windowId;
				wins[current_win] = [];

				for(var i=0; i<possibles.length; i++)
				{
					if(possibles[i].windowId !== current_win)
					{
						current_win = possibles[i].windowId;
						wins[current_win] = [];
					}

					wins[current_win].push(possibles[i]);							
				}

				if(wins[win.id] === undefined)
				{
					wins[win.id] = [];
				}

				var keys = Object.keys(wins).sort();

				if(keys[0] !== String(win.id))
				{
					var ind = keys.indexOf(String(win.id));
					var tail = keys.slice(ind + 1);
					keys.splice(ind);
					var winids = [String(win.id)].concat(tail).concat(keys);
				}

				else
				{
					var winids = keys;
				}

				for(var i=0; i<winids.length; i++)
				{
					for(var j=0; j<wins[winids[i]].length; j++)
					{
						var tab = wins[winids[i]][j];

						if(current_tab)
						{
							if(tab.windowId === current_tab.windowId)
							{
								if(tab.index > current_tab.index)
								{
									chrome.tabs.update(tab.id, {active: true});
									chrome.windows.update(tab.windowId, {focused: true});
									return;
								}
							}
							else
							{
								chrome.tabs.update(tab.id, {active: true});
								chrome.windows.update(tab.windowId, {focused: true});
								return;
							}
						}

						else
						{
							chrome.tabs.update(tab.id, {active: true});
							chrome.windows.update(tab.windowId, {focused: true});
							return;
						}
					}
				}

				chrome.tabs.update(possibles[0].id, {active: true});
				chrome.windows.update(possibles[0].windowId, {focused: true});
				return;
			}

			else
			{
				if(current_tab.audible)
				{
					chrome.tabs.update(current_tab.id, {active: true});
					chrome.windows.update(current_tab.windowId, {focused: true});
					return;
				}
			}
		});
	});
}





function goto_tab_pinned_nd_audible()
{
	var possibles = [];

	chrome.windows.getLastFocused(function(win)
	{
		var first_pinned = false;
		var current_tab = false;

		chrome.tabs.query({}, function(tabs)
		{
			for(var i=0; i<tabs.length; i++)
			{
				if(tabs[i].pinned && tabs[i].audible)
				{
					if(tabs[i].active && tabs[i].windowId == win.id)
					{
						current_tab = tabs[i];
						break;
					}
				}
			}

			for(var i=0; i<tabs.length; i++)
			{
				if(tabs[i].pinned && tabs[i].audible)
				{
					if(tabs[i] !== current_tab)
					{
						possibles.push(tabs[i]);
					}
				}
			}

			if(possibles.length)
			{
				var wins = {};
				var current_win = possibles[0].windowId;
				wins[current_win] = [];

				for(var i=0; i<possibles.length; i++)
				{
					if(possibles[i].windowId !== current_win)
					{
						current_win = possibles[i].windowId;
						wins[current_win] = [];
					}

					wins[current_win].push(possibles[i]);							
				}

				if(wins[win.id] === undefined)
				{
					wins[win.id] = [];
				}

				var keys = Object.keys(wins).sort();

				if(keys[0] !== String(win.id))
				{
					var ind = keys.indexOf(String(win.id));
					var tail = keys.slice(ind + 1);
					keys.splice(ind);
					var winids = [String(win.id)].concat(tail).concat(keys);
				}

				else
				{
					var winids = keys;
				}

				for(var i=0; i<winids.length; i++)
				{
					for(var j=0; j<wins[winids[i]].length; j++)
					{
						var tab = wins[winids[i]][j];

						if(current_tab)
						{
							if(tab.windowId === current_tab.windowId)
							{
								if(tab.index > current_tab.index)
								{
									chrome.tabs.update(tab.id, {active: true});
									chrome.windows.update(tab.windowId, {focused: true});
									return;
								}
							}
							else
							{
								chrome.tabs.update(tab.id, {active: true});
								chrome.windows.update(tab.windowId, {focused: true});
								return;
							}
						}

						else
						{
							chrome.tabs.update(tab.id, {active: true});
							chrome.windows.update(tab.windowId, {focused: true});
							return;
						}
					}
				}

				chrome.tabs.update(possibles[0].id, {active: true});
				chrome.windows.update(possibles[0].windowId, {focused: true});
				return;
			}

			else
			{
				if(current_tab.pinned &&  current_tab.audible)
				{
					chrome.tabs.update(current_tab.id, {active: true});
					chrome.windows.update(current_tab.windowId, {focused: true});
					return;
				}
			}
		});
	});
}


chrome.commands.onCommand.addListener(function(command)
{
	

	if (command == "goto_tab_pinned")
	{
		goto_tab_pinned();
		
	}

	else if (command == "close_tabs_pinned")
	{
		close_tabs_pinned();
	}
	
	else if (command == "goto_tab_audible")
	{
		goto_tab_audible();
	}
	
	else if (command == "close_tabs_audible")
	{
		close_tabs_audible();
	}
	
	else if (command == "goto_tab_pinned_nd_audible")
	{
		goto_tab_pinned_nd_audible();
	}
	
	
});





function close_tabs_pinned()
{
	chrome.windows.getLastFocused(function(win)
	{
		var last_pinned = false;
		var pinned_count = 0;
		chrome.tabs.query({}, function(tabs)
		{
			for(var i=0; i<tabs.length; i++)
			{
				if(tabs[i].pinned)
				{
					last_pinned = tabs[i];
					pinned_count += 1;
					if(tabs[i].active && tabs[i].windowId == win.id)
					{
						continue;
					}
					else
					{
						chrome.tabs.remove(tabs[i].id);
					}
				}
			}
			if(last_pinned && pinned_count == 1)
			{
				chrome.tabs.remove(last_pinned.id);
				return;
			}
		});
	});
}

function close_tabs_audible()
{
	chrome.windows.getLastFocused(function(win)
	{
		var last_audible = false;
		var audible_count = 0;
		chrome.tabs.query({}, function(tabs)
		{
			for(var i=0; i<tabs.length; i++)
			{
				if(tabs[i].audible)
				{
					last_audible = tabs[i];
					audible_count += 1;
					if(tabs[i].active && tabs[i].windowId == win.id)
					{
						continue;
					}
					else
					{
						chrome.tabs.remove(tabs[i].id);
					}
				}
			}
			if(last_audible && audible_count == 1)
			{
				chrome.tabs.remove(last_audible.id);
				return;
			}
		});
	});
}

chrome.contextMenus.removeAll(function() {
	chrome.contextMenus.create({
	  title: "close tabs pinned", 
	  contexts:["all"], 
	  onclick: close_tabs_pinned,
	});
})


chrome.contextMenus.removeAll(function() {
	chrome.contextMenus.create({
	  title: "close tabs audible", 
	  contexts:["all"], 
	  onclick: close_tabs_audible,
	});
})

chrome.contextMenus.removeAll(function() {
	chrome.contextMenus.create({
	  title: "go to pinned tabs ", 
	  contexts:["all"], 
	  onclick: goto_tab_pinned,
	});
})

chrome.contextMenus.removeAll(function() {
	chrome.contextMenus.create({
	  title: "go to audible tabs ", 
	  contexts:["all"], 
	  onclick: goto_tab_audible,
	});
})


chrome.contextMenus.removeAll(function() {
	chrome.contextMenus.create({
	  title: "go to audible  and pinned tabs ", 
	  contexts:["all"], 
	  onclick: goto_tab_pinned_nd_audible,
	});
})




chrome.browserAction.onClicked.addListener(goto_tab_pinned_nd_audible);


//EXTRAS 

        // clearTimeout(x); 
        // window.clearTimeout(x); 
		//	chrome.storage.sync.clear();
		

