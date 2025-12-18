#include <coap-simple.h>
#include <WiFi.h>
#include <WiFiUdp.h>

// ================= CONFIGURATION =================
const char* ssid     = "iPhone";
const char* password = "12345678";

// IP Address of the PHP Server
IPAddress coapServerIP(172, 20, 10, 2); // <--- CHANGE THIS TO YOUR PC IP

// UART Configuration
#define RXp2 16
#define TXp2 17
// =================================================

WiFiUDP udp;
Coap coap(udp);

void setup() {
  Serial.begin(115200); // Debug to computer
  
  // Initialize UART connection to Arduino Mega
  Serial2.begin(9600, SERIAL_8N1, RXp2, TXp2);
  Serial.println("ESP32 Listening on Serial2 (RX=16, TX=17)...");

  // Connect to WiFi
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  // Start CoAP
  coap.start();
}

void loop() {
  // 1. Maintain CoAP State
  coap.loop();

  // 2. Check if Arduino Mega sent data
  if (Serial2.available()) {
    // Read the line coming from Arduino
    String msg = Serial2.readStringUntil('\n');
    
    // Clean up the string (remove whitespace/newlines)
    msg.trim(); 

    if (msg.length() > 0) {
      Serial.print("UART Received: ");
      Serial.print(msg);
      Serial.println(" -> Forwarding to PHP...");

      // 3. Send to PHP via CoAP
      // msg.c_str() converts Arduino String to the char* required by CoAP library
      coap.put(coapServerIP, 5683, "bin/level", msg.c_str());
    }
  }
}
