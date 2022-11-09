
#include < MQTTClient.h > #include < ESP8266WiFi.h >
    // #include <DHT.h>
    //#include < OneWire.h > #include < DallasTemperature.h > #include < ArduinoJson.h >
    // Connectivity stuff here
    const char * ssid = "GEARTRACKS";
const char * password = "Raspberry";
const char * deviceID = "12345678";
// MQTT Stuff here
const char * server = "192.168.1.151"; // server or URL of MQTT broker
char * subscribeTopic = "flutter/12345678/"; // catenate the ID / hardcoded for now / subscribe to this topic; anything sent here will be passed into the messageReceived function / read for Activate Audio
char * mqTopic = "flutter"; //topic to publish sound readings to
// char * submergeDetect = "flutter/12345678/submerge/"; //topic to publish sound readings to
char * submergeAlarmDelay = 30; // Time after submerge before alarm is triggered
char * sleepmodeDelay = 60; // Time after SubmergeDetect=0 and waterDetect=0 to shut off wifi

// Hardware pins
const int  alarmRelayPin = 0;    
const int  alarmLedPin = 2;    
const int  waterDetectPin = 4;    
const int pressureDetectPin = 6;       // the pin that the LED is attached t

String clientName = "GEARTRACKS_flutter_ID12345678"; // just a name used to talk to MQTT broker
// sampling interval
long interval = 60000; //(ms) - milliseconds between reports = 1/sampling frequency AND on trigger/change
unsigned long resetPeriod = 864000000; // 1 day - this is the period after which we restart the CPU, to deal with odd memory leak errors
unsigned long prevTime;

// System & Alarm param object here OR get from MQTT

WiFiClient wifiClient;
MQTTClient client;

String macToStr(const uint8_t * mac) {
    String result;
    for (int i = 0; i < 6; ++i) {
        result += String(mac[i], 16);
        if (i < 5)
            result += ':';
    }
    return result;
}

// ### Sensor Specifics here ###
// Data wire is plugged into pin 2 on the Arduino
/*-----( Declare Constants )-----*/
#
define ONE_WIRE_BUS 2 /*-(Connect to Pin 2 )-*/

/*-----( Declare objects )-----*/
/* Set up a oneWire instance to communicate with any OneWire device*/
// OneWire ourWire(ONE_WIRE_BUS);

/* Tell Dallas Temperature Library to use oneWire Library */
// DallasTemperature sensors( & ourWire);

void setup() {
    Serial.begin(115200);

    // ### Start the Sensor library here ###
    //sensors.begin();
    // End sensor startup

    // Setup pins for 0 for alarm relay


    // Setup pins for water & pressure detection
    // initialize the button pin 2 water and 4 as pressure  input:
    pinMode(waterDetectPin, INPUT);
    pinMode(pressureDetectPin, INPUT);
    // initialize the relay  // LED as an output:
    pinMode(alarmRelayPin, OUTPUT); // relay
    pinMode(alarmLedPin, OUTPUT); // led

    client.begin(server, wifiClient);
    Serial.print("Connecting to ");
    Serial.println(ssid);
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());

    // Generate client name based on MAC address and last 8 bits of microsecond counter
    uint8_t mac[6];
    WiFi.macAddress(mac);
    clientName += macToStr(mac);
    clientName += "-";
    clientName += String(micros() & 0xff, 16);

    Serial.print("Connecting to ");
    Serial.print(server);
    Serial.print(" as ");
    Serial.println(clientName);

    if (client.connect((char * ) clientName.c_str())) {
        Serial.println("Connected to MQTT broker");
        Serial.print("Subscribed to: ");
        Serial.println(subscribeTopic);
        client.subscribe(subscribeTopic);

    } else {
        Serial.println("MQTT connect failed");
        Serial.println("Will reset and try again...");
        abort();
    }

    prevTime = 0;

}

void loop() {
    static int counter = 0;
    
    // Only if state has changed send new MQ beacon else wait for next cycle (counter to submit)


    // Setup the JSON stuff here
    // Write all data into a JSON object
    StaticJsonBuffer < 200 > jsonBuffer;
    JsonObject & tPayload = jsonBuffer.createObject();
    if (prevTime + interval < millis() || prevTime == 0) {
        prevTime = millis();
        Serial.print(" Updating status ...");
        // sensors.requestTemperatures(); // Send the command to get temperatures
        // Serial.println("DONE");

        Serial.print("Status device: ");
        //Serial.print(sensors.getTempCByIndex(0)); // Why "byIndex"? 
        //Serial.print(sensors.getTempFByIndex(0)); // Why "byIndex"? 
        // You can have more than one IC on the same bus. 
        // 0 refers to the first IC on the wire

        // Check if any reads failed and exit early (to try again).
        //        if (isnan(sensors.getTempCByIndex(0))) {Serial.println("Failed to read from sensor!");} else 
        if (!client.connected()) {
            Serial.println("Connection to broker lost; retrying");
        } else {
            // Generate JSON string for MQTT server
            // eg {"X":"38.56050207","Y":"121.42158374"} 
            // X=tempC and Y=TempF
            // form a JSON-formatted string:
            //char* tC=
            //char* tF=f2s(sensors.getTempFByIndex(0),0);
            //char* tPayload = "{\"X\"unsure emoticon"" + String(tC) + "\",\"Y\"unsure emoticon"" + String(tF) + "\"}";
            //char* tPayload = "{\"DeviceID\":\"" + deviceID + "\,\"status\":"}";
            tPayload["DeviceId"] = "12345678";
            tPayload["Coords"]="[5.8345443,-55.1573722]";
            tPayload["Date"]="";

            tPayload["Status"]="getStatus";

            tPayload.printTo(Serial);

            //Serial.println(t);
            //Serial.println(h);

            //Serial.println(tPayload);
            //Serial.println(hPayload);

            //client.publish(tempTopic, f2s(sensors.getTempCByIndex(0), 0));
            //client.publish(tempTopic, f2s(sensors.getTempCByIndex(0), 0));
            //client.publish(humidityTopic, hPayload);

            Serial.println("published temp data");
        }

    }

    client.loop();

    // reset after a day to avoid memory leaks 
    if (millis() > resetPeriod) {
        ESP.restart();
    }
}

char * getStatus(){
  int water = digitalRead(waterDetectPin);
  int pressure= digitalRead(pressureDetectPin);
  if( !water && !pressure)=0){
    return "out";
  } elseif (water && !pressure){
    return "in water";
  } elseif(water && pressure){
    return "submerged";
  } elseif (!water && pressur){
    return "check device";
  }

const int  waterDetectPin = 4;    

}

/* float to string
 * f is the float to turn into a string
 * p is the precision (number of decimals)
 * return a string representation of the float.
 */
char * f2s(float f, int p) {
    char * pBuff; // use to remember which part of the buffer to use for dtostrf
    const int iSize = 10; // number of buffers, one for each float before wrapping around
    static char sBuff[iSize][20]; // space for 20 characters including NULL terminator for each float
    static int iCount = 0; // keep a tab of next place in sBuff to use
    pBuff = sBuff[iCount]; // use this buffer
    if (iCount >= iSize - 1) { // check for wrap
        iCount = 0; // if wrapping start again and reset
    } else {
        iCount++; // advance the counter
    }
    return dtostrf(f, 0, p, pBuff); // call the library function
}

void messageReceived(String topic, String payload, char * bytes, unsigned int length) {
    // ### USE HERE TO RECEIVE CONFIGURATION OBJECT AND INSTANTIATE
    Serial.print("incoming: ");
    Serial.print(topic);
    Serial.print(" - ");
    Serial.print(payload);
    Serial.println();
}

