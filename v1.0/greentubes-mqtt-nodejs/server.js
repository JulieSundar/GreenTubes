var SerialPort  = require("serialport");
var portName = "/dev/ttyACM0";
var fs = require("fs");
var url = require("url");

var host = process.env.IP || '192.168.1.151';
var port = 443;

var fs = require('fs');
var express = require('express');
var app = express();

var options = {
    key: fs.readFileSync('./cert/file.pem'),
    cert: fs.readFileSync('./cert/file.crt')
};
var server = require('https').Server(options, app);

// Updated to Dynamic Socket server to cope with all name space issues
var io = require("socket.io").listen(server);
io.set('log level',0); // 0 - error ,1 - warn, 2 - info, 3 - debug

// var DynamicServer = require('dynamic.io');
// io = DynamicServer({
//     host: true,                     // Enable virtual host handling
//     publicStatus: true              // Enable /socket.io/status page.
// });
// // Any number of namespace patterns can be set up.
// // This is an example of a single catch-all pattern.
// io.setupNamespace(/.*/, function(nsp) {
//     nsp.on('connect', function(socket) {
//         console.log('socket connected ', nsp.fullname());
//     });
//     nsp.expire(function() {
//         console.log(nsp.fullname(), ' (expiring)');
//     });
// });

// io.listen(server);
// END UPDATE






var gpioService = require("./gpioService.js");

var staticSite = __dirname + '/public';
var swaggerUI = __dirname + '/public/swag-ui';

// MQTT MESSAGING
// create an mqtt MQTT_client object and connect to the mqtt broker
var mqtt = require('mqtt');

var MQTT_client = mqtt.connect('mqtt://m13.cloudmqtt.com:12626', {username:"nklvkunt", password:"_dGDY4A99qE7"}); //'mqtt://broker.hivemq.com') ; //186.179.142.169:52098', {username:"nklvkunt", password:"_dGDY4A99qE7"}); // broker.hivemq.com or test.mosquitto.org;
MQTT_client.on('connect', function(){
    console.log('MQTT connection up')
    MQTT_client.subscribe("#");
    
    MQTT_client.publish("test", "hello")

    // listen to messages coming from the mqtt broker
    MQTT_client.on('message', function(topic, payload) {
        //console.log ("hello MQTT");
        //console.log(topic +'='+ payload);
        io.sockets.emit('mqtt', {
            'topic': String(topic),
            'payload': String(payload),
        });
    });

    io.sockets.on('connection', function(socket) {
        console.log("sockets connected");
        // socket connection indicates what mqtt topic to subscribe to in data.topic
        socket.on('subscribe', function(data) {
            console.log('Subscribing to ' + data.topic);
            socket.join(data.topic);
            MQTT_client.subscribe(data.topic);
        });

        // when socket connection publishes a message, forward that message
        // the the mqtt broker
        socket.on('publish', function(data) {
            console.log('Publish to ' + data.topic + ' : ' + data.payload);
            var options = {
                qos: 0,
                retain: true
            };
            MQTT_client.publish(data.topic, data.payload, options);
        });

    });
});



// Hardware Libs
var rpio = require("pigpio").Gpio; // RaspberryIO -> switch on/off olimex solid state relay //raspi-io changed pigpio

// HANDLE LOCAL SERIAL PASS TO MQTT SERVER / REMOTE VIA API??
// =============================================================================
// 
var cleanData = ""; // this stores the clean data
var readData = "";  // this stores the buffer
function getConnectedArduinos() {
  SerialPort.list(function(err, ports) {
    var allports = ports.length;
    var count = 0;
    var done = false
    ports.forEach(function(port) {
      count += 1;
      pm = port['manufacturer'];
      if (typeof pm !== 'undefined' && pm.includes('arduino')) {
        arduinoport = port.comName.toString();
        var serialPort = require('serialport');
        sp = new serialPort(arduinoport, {
          buadRate: 9600
        })
        sp.on('open', function() {
          console.log('done! arduino is now connected at port: ' + arduinoport);
        });
        done = true;
        sp.on('data', (data) => {

            // Code works only for single Serial device
            try{
                readData += data.toString(); // append data to buffer

                // if the letters "{" and "\n" are found on the buffer then isolate what"s in the middle
                // as clean data. Then clear the buffer.
                if (readData.indexOf("\n") >= 0) {
                    // test if packet complete/valid json first
                    cleanData = readData.substring(readData.indexOf("{"), readData.indexOf("\n"));
                    readData = "";
                    //console.log(port.comName  + ' :  ' + cleanData);
                    //io.sockets.emit("publish", {topic: 'greentubes/001/basestation/update', payload : cleanData});
                    //io.sockets.emit("greentubes/001/basestation/update",cleanData);
                    // push valid JSON packages to MQTT
                    var options = {
                        qos: 0,
                        retain: true
                    };
                    MQTT_client.publish('greentubes/001/basestation/update', cleanData); //
                }
            }
            catch(error) {
              console.error(error);
              // expected output: SyntaxError: unterminated string literal
              // Note - error messages will vary depending on browser
            }

        });
        sp.on('error', (error) => {
            console.error(error);
        });
        //sp.send('hello from GreenTubes');
      }
      if (count === allports && done === false) {
         console.log('cant find arduino')
      }
    });

  });
}

getConnectedArduinos();


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); // get an instance of the express Router
//var router = require('express-router-wrapper')(express);

//var pigpio = require('pigpio');
router.route('/gpio')
    .get(function(req, res, next) {
        res.json(gpioService.gpioList());
    });


// return current status of all registered gpios or of a single one
router.route('/gpio/status/:gpio*')
    .get(function(req, res, next) {
        //console.log('Get status gpio'+ (typeof req.params.gpio != "undefined" ? req.params.gpio : 's'));
        //How to access a single key or value                                                       
        //var result=gpioService.gpioRead(req.params.gpio);
        //res.json(gpioService.gpioWrite(req.params.gpio, req.params.setvalue));
        var status = result.error ? 400 : 200;
        res.status(status).json(result);
    });

router.route('/gpio/test/:id')
    .get(function(req, res, next) {
        var result = gpioService.gpioToggle(req.params.id);
        var status = result.error ? 400 : 200;
        res.status(status).json(result);
    });

router.route('/gpio/:gpio/:setvalue') // app.get('path/:required/:optional?*, ...should work for path/meow, path/meow/voof, path/meow/voof/moo/etc
    .get(function(req, res, next) {
        //console.log('gpio'+ req.params.gpio + ' setvalue : ' + req.params.setvalue);
        //How to access a single key or value                               
        //console.log(JSON.stringify(req.params));                               
        var result = gpioService.gpioWrite(req.params.gpio, req.params.setvalue);
        var status = result.error ? 400 : 200;
        res.status(status).json(result);
    });

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.use('/', express.static(swaggerUI));

// ENABLE CORS for Express (so swagger.io and external sites can use it remotely .. SECURE IT LATER!!)
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/', express.static(staticSite));
// Use router for all /api requests
app.use('/api', router);

if (!process.env.C9_PID) {
    console.log('Running at http://' + host + ':' + port);
}
//app.listen(port, function() { console.log('Listening')});

server.listen(port, function() {
    console.log('Listening on ' + port)
});