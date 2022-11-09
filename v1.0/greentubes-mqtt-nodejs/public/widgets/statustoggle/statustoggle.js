
// start loading 
function load_statustoggle(title, div, par){
		// Generalize the widget to handle all toggles by entering div = *, the ID in the Data will serve as selector
        console.log("statustoggle : " + title + " to <div>" + div + "</div>");

        var socket = io.connect("/flowon", { 
            // defaults
            //socket_address : "/",
            bind_to: "data.FlowOn",
            //filter: "id=0001",
            reconnect : true,
            reconnection_delay : 500,
            max_reconnection_attempts : 10
        });

		socket.on("message", function (data) {
			// Generalize the widget to handle all toggles by entering div = *
			console.log(data);
			try{
				if (div=="*"){div=data.id};
				// Now switch the appropriate ID'd toggle button
				if(data.FLowOn==true){
					// switch button on 
					document.getElementById(div).checked=true;
				} else {
					// Switch to alarm state (Red BG + OFF)
					document.getElementById(div).checked=false;			
				}
			}
			catch{
				
			}

		});
};

//module.exports =  load_statustoggle;
