// LoRa transmitter and wifi access point

#include <Arduino.h>
#include <Adafruit_Sensor.h>
#include <LoRa.h>
#include <Time.h>
#include <SPI.h>
#include <WiFi.h>
#include <Wire.h>

#include "MAX30105.h"
#include "heartRate.h"

#include <DHT.h>
#include <DHT_U.h>

#include <Adafruit_MPU6050.h>

#include <Adafruit_BMP085.h>

#include <Adafruit_HMC5883_U.h>
#include <TinyGPS++.h>
#include <SoftwareSerial.h>

// Set web server port number to 80
WiFiServer server(80);

// Variable to store the HTTP request
String header;

#define ss 18
#define rst 14
#define dio0 26

#define seaLevelPressure_hPa 1013.25

const char* ssid     = "paul ward's hello hello";
const char* password = "1234567890";

// Blood Oxygen and Heart Rate
MAX30105 particleSensor;

const byte RATE_SIZE = 4; //Increase this for more averaging. 4 is good.
byte rates[RATE_SIZE]; //Array of heart rates
byte rateSpot = 0;
long lastBeat = 0; //Time at which the last beat occurred

float beatsPerMinute;
int beatAvg;

// Temperature and Humidity
#define DHT_PIN 23
#define DHT_TYPE DHT11
DHT dht(DHT_PIN, DHT_TYPE);
float DHT11_humidity = 0;
float DHT11_temp = 0;

// Accelerometer and Gyroscope
Adafruit_MPU6050 mpu;

// Altitude and Pressure 
Adafruit_BMP085 bmp;

// GPS and Compass
/* Assign a unique ID to this sensor at the same time */
Adafruit_HMC5883_Unified mag = Adafruit_HMC5883_Unified(12345);

// GPS Connections
static const int RXPin = 4, TXPin = 3;
//static const int RXPin = 3, TXPin = 1;
// GPS Baud rate (change if required)
static const uint32_t GPSBaud = 38400;
// String to hold GPS data
String gpstext;
 
// GPS write delay counter variables
// Change gpsttlcount as required
int gpscount = 0;
int gpsttlcount = 10;
// TinyGPS++ object
TinyGPSPlus gps;
 
// SoftwareSerial connection to the GPS device
SoftwareSerial swes(RXPin, TXPin);

int counter = 0;

void displaySensorDetails(void)
{
  sensor_t sensor;
  mag.getSensor(&sensor);
  Serial.println("------------------------------------");
  Serial.print  ("Sensor:       "); Serial.println(sensor.name);
  Serial.print  ("Driver Ver:   "); Serial.println(sensor.version);
  Serial.print  ("Unique ID:    "); Serial.println(sensor.sensor_id);
  Serial.print  ("Max Value:    "); Serial.print(sensor.max_value); Serial.println(" uT");
  Serial.print  ("Min Value:    "); Serial.print(sensor.min_value); Serial.println(" uT");
  Serial.print  ("Resolution:   "); Serial.print(sensor.resolution); Serial.println(" uT");  
  Serial.println("------------------------------------");
  Serial.println("");
  delay(500);
}

void setupWifi()
{
  Serial.print("Setting AP (Access Point)…");
  // Remove the password parameter, if you want the AP (Access Point) to be open
  WiFi.softAP(ssid, password);

  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(IP);
}

void setup() {
  // Serial Setup
  Serial.begin(115200);
  while (!Serial);

  // Connect to Wi-Fi network with SSID and password
  setupWifi();
  
  server.begin();

  // I2C Master Setup
  Wire.begin(); // join I2C bus as the master

  // LoRa Setup
  Serial.println("LoRa Sender");

  LoRa.setPins(ss, rst, dio0);

  // Start SoftwareSerial
  //swes.begin(GPSBaud);
  swes.begin(38400, SWSERIAL_8N1, RXPin, TXPin, false);
  if (!swes) { // If the object did not initialize, then its configuration is invalid
    Serial.println("Invalid SoftwareSerial pin configuration, check config"); 
    while (1) { // Don't continue with invalid configuration
      delay (1000);
    }
  } 
  
  //replace the LoRa.begin(---E-) argument with your location's frequency 
  //433E6 for Asia
  //866E6 for Europe
  //915E6 for North America
  while (!LoRa.begin(915E6)) {
    Serial.println(".");
    delay(500);
  }
   // Change sync word (0xF3) to match the receiver
  // The sync word assures you don't get LoRa messages from other LoRa transceivers
  // ranges from 0-0xFF
  LoRa.setSyncWord(0xF3);
  Serial.println("LoRa Initializing OK!");
  
  // ----------------------------------------------------------------------------------------------------------
  // MAX30102 Blood Oxygen Sensor Setup
  while(particleSensor.begin() == false) {
    Serial.println("MAX30102 was not found. Please check wiring/power.");
    delay(500);
  }

  particleSensor.setup(); //Configure sensor. Use 6.4mA for LED drive
  particleSensor.setPulseAmplitudeRed(0x0A); //Turn Red LED to low to indicate sensor is running
  particleSensor.setPulseAmplitudeGreen(0); //Turn off Green LED
  // ----------------------------------------------------------------------------------------------------------
  // DHT11
  dht.begin();
  // ----------------------------------------------------------------------------------------------------------
  // MPU6050
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
    while (1) {
      delay(10);
    }
  }
  Serial.println("MPU6050 Found!");

  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  Serial.print("Accelerometer range set to: ");
  switch (mpu.getAccelerometerRange()) {
  case MPU6050_RANGE_2_G:
    Serial.println("+-2G");
    break;
  case MPU6050_RANGE_4_G:
    Serial.println("+-4G");
    break;
  case MPU6050_RANGE_8_G:
    Serial.println("+-8G");
    break;
  case MPU6050_RANGE_16_G:
    Serial.println("+-16G");
    break;
  }
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  Serial.print("Gyro range set to: ");
  switch (mpu.getGyroRange()) {
  case MPU6050_RANGE_250_DEG:
    Serial.println("+- 250 deg/s");
    break;
  case MPU6050_RANGE_500_DEG:
    Serial.println("+- 500 deg/s");
    break;
  case MPU6050_RANGE_1000_DEG:
    Serial.println("+- 1000 deg/s");
    break;
  case MPU6050_RANGE_2000_DEG:
    Serial.println("+- 2000 deg/s");
    break;
  }

  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  Serial.print("Filter bandwidth set to: ");
  switch (mpu.getFilterBandwidth()) {
  case MPU6050_BAND_260_HZ:
    Serial.println("260 Hz");
    break;
  case MPU6050_BAND_184_HZ:
    Serial.println("184 Hz");
    break;
  case MPU6050_BAND_94_HZ:
    Serial.println("94 Hz");
    break;
  case MPU6050_BAND_44_HZ:
    Serial.println("44 Hz");
    break;
  case MPU6050_BAND_21_HZ:
    Serial.println("21 Hz");
    break;
  case MPU6050_BAND_10_HZ:
    Serial.println("10 Hz");
    break;
  case MPU6050_BAND_5_HZ:
    Serial.println("5 Hz");
    break;
  }

  Serial.println("");
  // ----------------------------------------------------------------------------------------------------------
  // BMP180
  while (!bmp.begin()) {
    Serial.println("Could not find a valid BMP085 sensor, check wiring!");
    delay(500);
  }
  // ----------------------------------------------------------------------------------------------------------
  // BN880
  while (!mag.begin()) {
    Serial.println("Could not find a valid BN880 sensor, check wiring!");
    delay(500);
  }
  /* Display some basic information on this sensor */
  displaySensorDetails();
  // ----------------------------------------------------------------------------------------------------------
}

float measureHeartRate() {
//  time_t t = now();
//  tem
}

// Function to return GPS string
String displayInfo()
{
  // Define empty string to hold output
  String gpsdata = "";

  // Get latitude and longitude
  if (gps.location.isValid())
  {
    gpsdata = String(gps.location.lat(), 6);
    gpsdata += (",");
    gpsdata += String(gps.location.lng(), 6);
    gpsdata += (",");
  }
  else
  {
    return "0";
  }

  // Get Date
  if (gps.date.isValid())
  {
    gpsdata += String(gps.date.year());
    gpsdata += ("-");
    if (gps.date.month() < 10) gpsdata += ("0");
    gpsdata += String(gps.date.month());
    gpsdata += ("-");
    if (gps.date.day() < 10) gpsdata += ("0");
    gpsdata += String(gps.date.day());
  }
  else
  {
    return "0";
  }

  // Space between date and time
  gpsdata += (" ");

  // Get time
  if (gps.time.isValid())
  {
    if (gps.time.hour() < 10) gpsdata += ("0");
    gpsdata += String(gps.time.hour());
    gpsdata += (":");
    if (gps.time.minute() < 10) gpsdata += ("0");
    gpsdata += String(gps.time.minute());
    gpsdata += (":");
    if (gps.time.second() < 10) gpsdata += ("0");
    gpsdata += String(gps.time.second());
  }
  else
  {
    return "0";
  }

  // Return completed string
  return gpsdata;
}

void setupWebPage(WiFiClient client) {
  Serial.println("New Client.");          // print a message out in the serial port
  int counter = 0;
    String currentLine = "";                // make a String to hold incoming data from the client
    String temp = "";
    while (client.connected()) {            // loop while the client's connected
      if (client.available()) {             // if there's bytes to read from the client,
        char c = client.read();             // read a byte, then
        Serial.write(c);                    // print it out the serial monitor
        header += c;
        if (c == '\n') {                    // if the byte is a newline character
          // if the current line is blank, you got two newline characters in a row.
          // that's the end of the client HTTP request, so send a response:
          if (currentLine.length() == 0) {
            // HTTP headers always start with a response code (e.g. HTTP/1.1 200 OK)
            // and a content-type so the client knows what's coming, then a blank line:
            client.println("HTTP/1.1 200 OK");
            client.println("Content-type:text/html");
            client.println("Connection: close");
            client.println();
            
            // turns the GPIOs on and off
            if (header.indexOf("POST /user/msg?msg=") >= 0) {
              Serial.println("[ALERT] GOT MESSAGE FROM USER");
              temp = temp + c;
            }
//            } else if (header.indexOf("GET /26/off") >= 0) {
//              Serial.println("GPIO 26 off");
//              output26State = "off";
//              digitalWrite(output26, LOW);
//            } else if (header.indexOf("GET /27/on") >= 0) {
//              Serial.println("GPIO 27 on");
//              output27State = "on";
//              digitalWrite(output27, HIGH);
//            } else if (header.indexOf("GET /27/off") >= 0) {
//              Serial.println("GPIO 27 off");
//              output27State = "off";
//              digitalWrite(output27, LOW);
//            }
            
            // Display the HTML web page
            client.println("<!DOCTYPE html><html>");
            client.println("<head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">");
            client.println("<link rel=\"icon\" href=\"data:,\">");
            // CSS to style the on/off buttons 
            // Feel free to change the background-color and font-size attributes to fit your preferences
            client.println("<style>html { font-family: Helvetica; display: inline-block; margin: 0px auto; text-align: center;}");
            client.println(".button { background-color: #4CAF50; border: none; color: white; padding: 16px 40px;");
            client.println("text-decoration: none; font-size: 30px; margin: 2px; cursor: pointer;}");
            client.println(".button2 {background-color: #555555;}</style></head>");
            
            // Web Page Heading
            client.println("<body><h1>Rescue Portal</h1>");
            
            // Prompt the user to enter a message 
            client.println("<p> Please enter any important information </p>"); 
            client.println("<textarea name='text' cols='40' rows='10' id='text'></textarea>");
            //client.println("<p><a href=\"/user/msg\"><button class=\"button\" onClick='(function() { var msg = document.getElementById('text').value;  })'>Enter</button></a></p>");
            //client.println("<p><button class=\"button\" onClick='(function() { var msg = document.getElementById(\"text\").value; var xhr=new XMLHttpRequest(); xhr.open(\"POST\",\"/user/msg\", true); xhr.setRequestHeader(\"Content-Type\",\"application/json\"); xhr.send(JSON.stringify({value:\"max likes penis\"}))})();'>Enter</button></p>");
            client.println("<p><button class=\"button\" onClick='(function() { var msg = document.getElementById(\"text\").value; var xhr=new XMLHttpRequest(); xhr.open(\"POST\",`/user/msg?msg=${msg}`, true); xhr.setRequestHeader(\"Content-Type\",\"application/json\"); xhr.send({}); })();'>Enter</button></p>");
          
            client.println("</body></html>");
            
            // The HTTP response ends with another blank line
            client.println();
            // Break out of the while loop
            break;
          } else { // if you got a newline, then clear currentLine
            Serial.println("BEFORE BEFORE BFORE");
            Serial.println(currentLine);
            if (counter == 0) {
              int begin = 19;
              int end = currentLine.length() - 9;
              String msg =  "";
              for (int i = begin; i < end; i++) {
                msg += currentLine[i];
              }
              Serial.println(msg);

              Serial.println("[INFO] Sending user message: ");
  
              LoRa.beginPacket();
              LoRa.print("m ");
              LoRa.print(msg);
              LoRa.endPacket();
            
              delay(100);
            }
            counter++;
            currentLine = "";
          }
        } else if (c != '\r') {  // if you got anything else but a carriage return character,
          currentLine += c;      // add it to the end of the currentLine
        }
      }
      Serial.println("FIRST FIRST FIRST");
      Serial.print(temp);
    }
    Serial.println("SECOND SECONDS SEPCD ");
    Serial.print(temp);
}

void loop() {
  WiFiClient client = server.available();

  if (client) {
    setupWebPage(client);
  }
  
  // MAX30102
  long irValue = particleSensor.getIR();
  long RValue = particleSensor.getRed();
  Serial.print("[DEBUG] irValue: ");
  Serial.println(irValue);

  if (checkForBeat(irValue) == true) {
    Serial.print("[INFO] FOUND BEAT");
    //We sensed a beat!
    long delta = millis() - lastBeat;
    lastBeat = millis();

    beatsPerMinute = 60 / (delta / 1000.0);

    if (beatsPerMinute < 255 && beatsPerMinute > 20) {
      rates[rateSpot++] = (byte)beatsPerMinute; //Store this reading in the array
      rateSpot %= RATE_SIZE; //Wrap variable

      //Take average of readings
      beatAvg = 0;
      for (byte x = 0 ; x < RATE_SIZE ; x++)
        beatAvg += rates[x];
      beatAvg /= RATE_SIZE;
    }
  }

  Serial.print("[INFO] IR=");
  Serial.print(irValue);
  Serial.print(", BPM=");
  Serial.print(beatsPerMinute);
  Serial.print(", Avg BPM=");
  Serial.print(beatAvg);

  if (irValue < 50000)
    Serial.print(" No finger?");

  Serial.println();

  // DHT11
  DHT11_humidity = dht.readHumidity();
  Serial.print("[INFO] Current Humidity = "); Serial.print(DHT11_humidity); Serial.println(" %");

  DHT11_temp = dht.readTemperature();
  Serial.print("[INFO] Current Temperature = "); Serial.print(DHT11_temp); Serial.println(" %");

  // MPU6050
  /* Get new sensor events with the readings */
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  /* Print out the values */
  Serial.println("[INFO] Acceleration X: ");
  Serial.print(a.acceleration.x);
  Serial.print(", Y: ");
  Serial.print(a.acceleration.y);
  Serial.print(", Z: ");
  Serial.print(a.acceleration.z);
  Serial.println(" m/s^2");

  Serial.println("[INFO] Rotation X: ");
  Serial.print(g.gyro.x);
  Serial.print(", Y: ");
  Serial.print(g.gyro.y);
  Serial.print(", Z: ");
  Serial.print(g.gyro.z);
  Serial.println(" rad/s");

  // BMP180
  Serial.println("[INFO] Pressure = ");
  Serial.print(bmp.readPressure());
  Serial.println(" Pa");

  Serial.println("[INFO] Altitude = ");
  Serial.print(bmp.readAltitude());
  Serial.println(" meters");

  Serial.println("[INFO] Pressure at sealevel (calculated) = ");
  Serial.print(bmp.readSealevelPressure());
  Serial.println(" Pa");

  Serial.println("[INFO] Real altitude = ");
  Serial.print(bmp.readAltitude(seaLevelPressure_hPa * 100));
  Serial.println(" meters");

  // BN880
  /* Get a new sensor event */ 
  sensors_event_t event; 
  mag.getEvent(&event);
 
  /* Display the results (magnetic vector values are in micro-Tesla (uT)) */
  Serial.print("X: "); Serial.print(event.magnetic.x); Serial.print("  ");
  Serial.print("Y: "); Serial.print(event.magnetic.y); Serial.print("  ");
  Serial.print("Z: "); Serial.print(event.magnetic.z); Serial.print("  ");Serial.println("uT");
 
  // Hold the module so that Z is pointing 'up' and you can measure the heading with x&y
  // Calculate heading when the magnetometer is level, then correct for signs of axis.
  float heading = atan2(event.magnetic.y, event.magnetic.x);
  
  // Once you have your heading, you must then add your 'Declination Angle', which is the 'Error' of the magnetic field in your location.
  // Find yours here: http://www.magnetic-declination.com/
  // Mine is: -13* 2' W, which is ~13 Degrees, or (which we need) 0.22 radians
  // If you cannot find your Declination, comment out these two lines, your compass will be slightly off.
  float declinationAngle = 0.16;
  heading += declinationAngle;
  
  // Correct for when signs are reversed.
  if(heading < 0)
    heading += 2*PI;
    
  // Check for wrap due to addition of declination.
  if(heading > 2*PI)
    heading -= 2*PI;
   
  // Convert radians to degrees for readability.
  float headingDegrees = heading * 180/M_PI; 
  
  Serial.print("Heading (degrees): "); Serial.println(headingDegrees);

  // GPS
  // See if data available
//  while (swes.available() > 0)
//    Serial.println("[INFO] SWES Available ");
//    Serial.print(swes.read());
//    if (gps.encode(swes.read()))
//      Serial.print("[INFO] SWES Read ");
//      // See if we have a complete GPS data string
//      if (displayInfo() != "0")
//      {
//
//        // Get GPS string
//        gpstext = displayInfo();
//
//
//        // Check GPS Count
//        Serial.println(gpscount);
//        if (gpscount == gpsttlcount) {
//
//          Serial.print("[INFO] GPS text ");
//          Serial.println(gpstext);
//
//          Serial.println("[INFO] Sending gps: ");
//
//          LoRa.beginPacket();
//          LoRa.print("g ");
//          LoRa.print(gpstext);
//          LoRa.endPacket();
//        
//          delay(100);
//          
//        }
//        // Increment GPS Count
//        gpscount = gpscount + 1;
//        if (gpscount > gpsttlcount) {
//          gpscount = 0;
//        }
//
//      }
  
  Serial.println();

  //Send LoRa packets to receiver
  Serial.print("[INFO] Sending IR: ");
  LoRa.beginPacket();
  LoRa.print("infrared ");
  LoRa.print(irValue);
  LoRa.endPacket();

  delay(100);

  Serial.print("[INFO] Sending Red: ");
  LoRa.beginPacket();
  LoRa.print("red ");
  LoRa.print(RValue);
  LoRa.endPacket();

  delay(100);
  
  Serial.println("[INFO] Sending humidity: ");
  LoRa.beginPacket();
  LoRa.print("humidity ");
  LoRa.print(DHT11_humidity);
  LoRa.endPacket();
  
  delay(100);
  
  Serial.println("[INFO] Sending temp: ");
  LoRa.beginPacket();
  LoRa.print("temp ");
  LoRa.print(DHT11_temp);
  LoRa.endPacket();

  delay(100);

  Serial.println("[INFO] Sending acceleration: ");
  
  LoRa.beginPacket();
  LoRa.print("ax ");
  LoRa.print(a.acceleration.x);
  LoRa.endPacket();

  delay(100);

  LoRa.beginPacket();
  LoRa.print("ay ");
  LoRa.print(a.acceleration.y);
  LoRa.endPacket();

  delay(100);
  
  LoRa.beginPacket();
  LoRa.print("az ");
  LoRa.print(a.acceleration.z);
  LoRa.endPacket();

  delay(100);

  Serial.println("[INFO] Sending rotation: ");

  LoRa.beginPacket();
  LoRa.print("rx ");
  LoRa.print(g.gyro.x);
  LoRa.endPacket();

  delay(100);

  LoRa.beginPacket();
  LoRa.print("ry ");
  LoRa.print(g.gyro.y);
  LoRa.endPacket();

  delay(100);

  LoRa.beginPacket();
  LoRa.print("rz ");
  LoRa.print(g.gyro.z);
  LoRa.endPacket();

  delay(100);

  Serial.println("[INFO] Sending altitude: ");

  LoRa.beginPacket();
  LoRa.print("l ");
  LoRa.print(bmp.readAltitude(seaLevelPressure_hPa * 100));
  LoRa.endPacket();

  delay(100);

  Serial.println("[INFO] Sending pressure: ");

  LoRa.beginPacket();
  LoRa.print("p ");
  LoRa.print(bmp.readSealevelPressure());
  LoRa.endPacket();

  delay(100);

  Serial.println("[INFO] Sending compass: ");

  LoRa.beginPacket();
  LoRa.print("c ");
  LoRa.print(headingDegrees);
  LoRa.endPacket();

  delay(100);
  
  counter++;

  delay(500);
}
