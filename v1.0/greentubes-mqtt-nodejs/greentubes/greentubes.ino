#include <ArduinoJson.h>

const int analogInPin = A0;  // Analog input pin that the potentiometer is attached to
int sensorValue = 0;        // value read from the pot

String strold("");
String strnew("");

void setup() {
  	// initialize serial communications at 9600 bps:
	Serial.begin(9600);
}
  
void loop() {
  // json buffer object
  //DynamicJsonBuffer jsonBuffer;
  StaticJsonBuffer<200> jsonBuffer;

  // Create JSON Object with sensor data
  JsonObject& root = jsonBuffer.createObject();

  // read the analog in value:
  root["MoistureLevel"]= analogRead(analogInPin);
  root["Temp"]= 22;

  //JsonArray& data = root.createNestedArray("data");
  //data.set(0, 0.756080);
  //data.set(1, analogRead(analogInPin));
  // convert active part of json object to readable string for comparison
  root.printTo(strnew);

  // If the previous value is the same as the new one, the do not send to save
  // communication link between the Arduino and the PC. 
  if (strnew != strold) {
    // keep current data for next cycle
  	strold=strnew;
  	// before shipping add the static/id info
  	root["id"] = "0001";
  	root["sensor"] = "gps";
  	root["time"] = 1351824120;
  	root.printTo(Serial);
  	Serial.print("\n"); // print end of line

    //preserve previous value
    strold=strnew
  }
  // wait 500 milliseconds before the next loop
  delay(1000);                     
}

