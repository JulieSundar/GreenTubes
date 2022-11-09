//#define BLUETOOTH
#define OTA_HANDLER 

//#define MODE_AP // phone connects directly to ESP
#define MODE_STA // ESP connects to WiFi router

#include <esp_wifi.h>
#include <WiFi.h>

#ifdef BLUETOOTH
#include <BluetoothSerial.h>
BluetoothSerial SerialBT; 
#endif

#ifdef OTA_HANDLER  
#include <ArduinoOTA.h> 

#endif // OTA_HANDLER

#include <PubSubClient.h>
#include <WiFiClient.h>

#define RXD2 16
#define TXD2 17
#define LED 13
// Update these with values suitable for your network.
const char* ssid = "IoTLab_Guest";//"telew_f2b";
const char* password = "Guest@IoT";
const char* mqtt_server = "192.168.1.150";  //"iot.eclipse.org";
#define mqtt_port 1883
//#define MQTT_USER "juliesundar123@gmail.com"
//#define MQTT_PASSWORD "HELENKELLER1"
#define MQTT_SERIAL_PUBLISH_CH "/ESP/"   //"/ic/nm/serialdata/uno/"
#define MQTT_SERIAL_SUBSCRIBE_CH "/ESP/33/"   //"/ic/nm/serialdata/uno/"

WiFiClient wifiClient;

PubSubClient client(wifiClient);

void setup() {
  Serial.begin(115200);
  pinMode(LED,OUTPUT);
  Serial2.begin(9600, SERIAL_8N1, RXD2, TXD2);
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  //set callback to receive messages//
  client.setCallback(MQTTcallback);
  reconnect();
  delay(500);
 
  
#ifdef OTA_HANDLER  
  ArduinoOTA
    .onStart([]() {
      String type;
      if (ArduinoOTA.getCommand() == U_FLASH)
        type = "sketch";
      else // U_SPIFFS
        type = "filesystem";

      // NOTE: if updating SPIFFS this would be the place to unmount SPIFFS using SPIFFS.end()
      Serial.println("Start updating " + type);
    })
    .onEnd([]() {
      Serial.println("\nEnd");
    })
    .onProgress([](unsigned int progress, unsigned int total) {
      Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
    })
    .onError([](ota_error_t error) {
      Serial.printf("Error[%u]: ", error);
      if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
      else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
      else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
      else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
      else if (error == OTA_END_ERROR) Serial.println("End Failed");
    });
  // if DNSServer is started with "*" for domain name, it will reply with
  // provided IP to all DNS request

  ArduinoOTA.begin();
#endif // OTA_HANDLER    

}

void setup_wifi() {
    delay(10);
    // We start by connecting to a WiFi network
    Serial.println();
    Serial.print("Connecting to ");
    Serial.println(ssid);
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
    }
    randomSeed(micros());
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "NodeMCUClient-";
    clientId += String(random(0xffff), HEX);
    // Attempt to connect
    if (client.connect(clientId.c_str())) { //,MQTT_USER,MQTT_PASSWORD
      Serial.println("connected");
      //Once connected, publish an announcement...
      client.publish("/ESP/", "esp here");
      client.subscribe("/ESP/#");
      //client.publish("esp/test", "Hello from ESP8266");
      //client.subscribe("esp/test");
      
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(2000);
    }
  }
}


void publishMQTTData(char *topic, char *payload){
  if (!client.connected()) {
    reconnect();
  }
  client.publish(topic, payload);
  //client.loop();
}

// //
void MQTTcallback(char* topic, byte* payload, unsigned int length) {
 
  Serial.print("Message arrived in topic: ");
  Serial.println(topic);
 
  Serial.print("Message:");
 
  String message;
  for (int i = 0; i < length; i++) {
    message = message + (char)payload[i];  //Conver *byte to String
  }
   Serial.print(message);
  if(message == "#on") {digitalWrite(LED,LOW);}   //LED on  
  if(message == "#off") {digitalWrite(LED,HIGH);} //LED off
 
  Serial.println();
  Serial.println("-----------------------");  
}

void loop() {
   client.loop();
   while (Serial2.available() > 0) {
     //Serial.print(char(Serial2.read()));
     char bfr1[101];
     memset(bfr1,0, 101);    
     Serial2.readBytesUntil( '=',bfr1,100);

     char bfr2[101];
     memset(bfr2,0, 101);
     Serial2.readBytesUntil( '\n',bfr2,100);
     publishMQTTData(bfr1,bfr2);
     //Serial.print(char(Serial2.read()));
     // reset both buffers
   }
    #ifdef OTA_HANDLER  
    ArduinoOTA.handle();
    #endif // OTA_HANDLER
 }
