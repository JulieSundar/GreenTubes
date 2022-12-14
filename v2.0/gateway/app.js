var util = require('util');
var net = require('net');
var mqtt = require('mqtt');
var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs")
    port = process.argv[2] || 8888;

var io  = require('socket.io').listen(5000);
var client  = mqtt.connect('mqtt://127.0.0.1');

client.on('connect', function () {
  client.subscribe('/ESP/#');
  client.publish('/ESP/Dashboard/', 'Connected to MQTT-Server');
  console.log("\nDashboard App Connected to MQTT-Server\n");
});

client.on('message', function(topic, message){
  console.log(topic+'='+message);
  io.sockets.emit('mqtt',{'topic':String(topic),
    'payload':String(message)});
});

io.sockets.on('connection', function (socket) {
  socket.on('subscribe', function (data) {
    console.log('Subscribing to '+data.topic);
    socket.join(data.topic);
    client.subscribe(data.topic);
  });
  socket.on('control', function (data) {
    console.log('Receiving for MQTT '+ data.topic + data.payload);
	// TODO sanity check .. is it valid topic ... check ifchannel is "mqtt" and pass message to MQTT server
    client.publish(data.topic, data.payload);
  }); 

});



http.createServer(function(request, response) {

  var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri);

  fs.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }

      response.writeHead(200);
      response.write(file, "binary");
      response.end();
    });
  });
}).listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
