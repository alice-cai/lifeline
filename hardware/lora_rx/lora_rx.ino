// LoRa receiver module and wifi client

#include <Arduino.h>
#include <FirebaseESP32.h>
#include <LoRa.h>
#include <SPI.h>
#include <WiFi.h>

//#define SSID "HackTheNorth"
//#define PASSWORD "uwaterloo"
#define SSID "Max's iPhone"
#define PASSWORD "1234567890"

#define CONNECTION_TIMEOUT 10

#define FIREBASE_AUTH "UcaPiqeQAnt6ONhngbqnE4U15tw87Su0Idf4eM5j"
#define FIREBASE_HOST "https://hackthenorth2022-8888-default-rtdb.firebaseio.com/"

#define ss 18
#define rst 14
#define dio0 26

//Define Firebase Data object
FirebaseData fbdo;

int counter = 0;

void ConnectToWifi()
{
  delay(100);
  Serial.print("Connecting to ");
  Serial.print(SSID);
  /* Explicitly set the ESP8266 to be a WiFi-client, otherwise, it by default,
  would try to act as both a client and an access-point and could cause
  network-issues with your other WiFi-devices on your WiFi-network. */
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  Serial.println("\nBegin connecting to wifi");
  //start connecting to WiFi
  WiFi.begin("HackTheNorth", "uwaterloo");
  //while client is not connected to WiFi keep loading
  int timeout_counter = 0;
  while (WiFi.status() != WL_CONNECTED) {
      Serial.print(".");
      delay(200);
      timeout_counter++;
      if(timeout_counter >= CONNECTION_TIMEOUT*5) {
        ESP.restart();
      }
  }
  Serial.println("");
  Serial.print("WiFi connected to ");
  Serial.println(SSID);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.println("");
}

void setup(){
  Serial.begin(115200);
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);

  Serial.println("LoRa Receiver");
  //setup LoRa transceiver module
  LoRa.setPins(ss, rst, dio0);

  //replace the LoRa.begin(---E-) argument with your location's frequency 
  //433E6 for Asia
  //866E6 for Europe
  //915E6 for North America
  Serial.println("\nBegin setting up LoRa");
  while (!LoRa.begin(915E6)) {
    Serial.println(".");
    delay(500);
  }
   // Change sync word (0xF3) to match the receiver
  // The sync word assures you don't get LoRa messages from other LoRa transceivers
  // ranges from 0-0xFF
  LoRa.setSyncWord(0xF3);
  Serial.println("LoRa Initializing OK!");
  
  ConnectToWifi();  
}

void loop(){
  counter++;

  if (WiFi.status() != WL_CONNECTED) {
    ConnectToWifi();
  }
  
  // try to parse packet
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    // received a packet
    Serial.print("Received packet '");
    String LoRaData = "";

    // read packet
    while (LoRa.available()) {
      LoRaData = LoRa.readString();
      Serial.print(LoRaData); 
    }

    // print RSSI of packet
    Serial.print("' with RSSI ");
    Serial.println(LoRa.packetRssi());

    if (LoRaData[0] == 'i') {
      if (Firebase.pushString(fbdo, "rx_module0/infrared light", LoRaData)){
        Serial.println("SUCCESS");
      }
      else {
        Serial.print("FAIL");
      }
    }
    else if (LoRaData[0] == 'r' && LoRaData[0] == 'e') {
      if (Firebase.pushString(fbdo, "rx_module0/red light", LoRaData)){
        Serial.println("SUCCESS");
      }
      else {
        Serial.print("FAIL");
      }
    }
    else if (LoRaData[0] == 'h') {
      if (Firebase.pushString(fbdo, "rx_module0/humidity", LoRaData)){
        Serial.println("SUCCESS");
      }
      else {
        Serial.print("FAIL");
      }
    }
    else if (LoRaData[0] == 't') {
      if (Firebase.pushString(fbdo, "rx_module0/temp", LoRaData)){
        Serial.println("SUCCESS");
      }
      else {
        Serial.print("FAIL");
      }
    }
    else if (LoRaData[0] == 'a' && LoRaData[1] == 'x') {
      if (Firebase.pushString(fbdo, "rx_module0/x acceleration", LoRaData)){
        Serial.println("SUCCESS");
      }
      else {
        Serial.print("FAIL");
      }
    }
    else if (LoRaData[0] == 'a' && LoRaData[1] == 'y') {
      if (Firebase.pushString(fbdo, "rx_module0/y acceleration", LoRaData)){
        Serial.println("SUCCESS");
      }
      else {
        Serial.print("FAIL");
      }
    }
    else if (LoRaData[0] == 'a' && LoRaData[1] == 'z') {
      if (Firebase.pushString(fbdo, "rx_module0/z acceleration", LoRaData)){
        Serial.println("SUCCESS");
      }
      else {
        Serial.print("FAIL");
      }
    }
    else if (LoRaData[0] == 'r' && LoRaData[1] == 'x') {
      if (Firebase.pushString(fbdo, "rx_module0/x rotation", LoRaData)){
        Serial.println("SUCCESS");
      }
      else {
        Serial.print("FAIL");
      }
    }
    else if (LoRaData[0] == 'r' && LoRaData[1] == 'y') {
      if (Firebase.pushString(fbdo, "rx_module0/y rotation", LoRaData)){
        Serial.println("SUCCESS");
      }
      else {
        Serial.print("FAIL");
      }
    }
    else if (LoRaData[0] == 'r' && LoRaData[1] == 'z') {
      if (Firebase.pushString(fbdo, "rx_module0/z rotation", LoRaData)){
        Serial.println("SUCCESS");
      }
      else {
        Serial.print("FAIL");
      }
    }
    else if (LoRaData[0] == 'l') {
      if (Firebase.pushString(fbdo, "rx_module0/altitude", LoRaData)){
        Serial.println("SUCCESS");
      }
      else {
        Serial.print("FAIL");
      }
    }
    else if (LoRaData[0] == 'p') {
      if (Firebase.pushString(fbdo, "rx_module0/pressure", LoRaData)){
        Serial.println("SUCCESS");
      }
      else {
        Serial.print("FAIL");
      }
    }
    else if (LoRaData[0] == 'c') {
      if (Firebase.pushString(fbdo, "rx_module0/compass", LoRaData)){
        Serial.println("SUCCESS");
      }
      else {
        Serial.print("FAIL");
      }
    }
    else if (LoRaData[0] == 'g') {
      if (Firebase.pushString(fbdo, "rx_module0/gps", LoRaData)){
        Serial.println("SUCCESS");
      }
      else {
        Serial.print("FAIL");
      }
    }
    else if (LoRaData[0] == 'm') {
      if (Firebase.pushString(fbdo, "rx_module0/msg", LoRaData)){
        Serial.println("SUCCESS");
      }
      else {
        Serial.print("FAIL");
      }
    }
  }
}
