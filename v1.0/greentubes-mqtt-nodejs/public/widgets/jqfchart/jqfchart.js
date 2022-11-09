// start loading 
function load_jqfchart(title, div, par){
    console.log("jqfchart : " + title + " to <div>" + div + "</div>" + "  ..listen to: " + par.data.topic);
    var $monitor = $("#" + div);
    var p1 = [];

// ### Add default param object and merge
    var socket = io.connect(par.data.socket_address || "/");
    // var socket = io.connect(par.data.socket_address || "/", { 
    //     reconnect : par.data.reconnect || true,
    //     reconnection_delay : par.data.reconnection_delay||500,
    //     max_reconnection_attempts : par.data.max_reconnection_attempts||10
    // });
    socket.on('connect', function () {
        socket.on('mqtt', function (data) {
            //console.log(msg.topic+' '+msg.payload);

            var arr = [];
            data=JSON.parse(data.payload);
            console.log(JSON.stringify(data));
            if(p1.length > 9) p1.shift(); // Remove first items
            p1.push(data.MoistureLevel);
            
            for(var i = 0; i < p1.length; i++) {
                arr.push([i, p1[i]]);
            } 
            $.plot($monitor, [arr], par.chart);
        });

        socket.emit('subscribe',{topic:par.data.topic});   
        //$.plot($monitor, [p1], par.chart);
    });
};

//module.exports =  load_jqfchart;
