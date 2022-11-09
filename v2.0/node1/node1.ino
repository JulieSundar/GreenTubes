#include <DHT.h>
#include <DHT_U.h>

#include <SoftwareSerial.h>
SoftwareSerial sw(8, 9); // 8,9 RX, TX
char r;
String incoming;

#define humidity_topic "/ESP/33/Humidity/"
#define temperature_topic "/ESP/33/Temperature/"
#define soil_topic "/ESP/33/Soil/"
const int ledPin=13;

#define DHTPIN 10     // Digital pin connected to the DHT sensor

#define DHTTYPE DHT11   // DHT 11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  Serial.println("Interfacfing arduino with nodemcu");
  sw.begin(9600);
  sw.println("sw ready");
  dht.begin();
  pinMode(ledPin,OUTPUT);
}

void loop() {
  //Parse incoming serial string
    if (sw.available()) {
    digitalWrite(ledPin, HIGH);
    // read the incoming byte till end
    r = sw.read();
    incoming = incoming + r;
    // look for = and split string into topic & payload/command strings


    // Switch controller as requested


    // Send a message back after success
    
    sw.print(r);
    Serial.println(incoming);
    digitalWrite(ledPin, LOW);
  }
  //end echo

  // Wait a few seconds between measurements.
  delay(2000);
  //Soil Moisture
 
  // Reading temperature or humidity takes about 250 milliseconds!
  // Sensor readings may also be up to 2 seconds 'old' (its a very slow sensor)
  int sensorValue = analogRead(A2);
  
  float h = dht.readHumidity();
  // Read temperature as Celsius (the default)
  float t = dht.readTemperature();
  // Read temperature as Fahrenheit (isFahrenheit = true)
  float f = dht.readTemperature(true);

  // Check if any reads failed and exit early (to try again).
  //if (isnan(h) || isnan(t) || isnan(f)) {
   // Serial.println(F("Failed to read from DHT sensor!"));
   // return;
  //}

  // Compute heat index in Fahrenheit (the default)
  float hif = dht.computeHeatIndex(f, h);
  // Compute heat index in Celsius (isFahreheit = false)
  float hic = dht.computeHeatIndex(t, h, false);
  
  //TEMP INFO
   Serial.print(humidity_topic); // Humidity topic here
   Serial.print("=");
   Serial.println(h);
   
   sw.print(humidity_topic); // Humidity topic here
   sw.print("=");
   sw.println(h);
   //sw.println("}");
   delay(50);
  //Arduino HUMIDITY
  Serial.print(temperature_topic); //Temperature topic here
  Serial.print("=");
  Serial.println(t);//sensor id

  //sw.print("{\"Temperature\":"); //Celcius
  sw.print(temperature_topic); //Temperature topic here
  sw.print("=");
  sw.println(t);//sensor id
  //sw.println("}");
  delay(50);
  //Soil Sensor Data
 Serial.print(soil_topic);
 Serial.print("=");
 Serial.println(sensorValue);
 sw.print(soil_topic);
 sw.print("=");
 sw.println(sensorValue);
 delay(50);
}
