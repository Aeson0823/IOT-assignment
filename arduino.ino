#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Servo.h> 

// ================= CONFIGURATION =================
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Pin Definitions
const int trigPin1 = 9;   // Sensor 1 (Bin Level)
const int echoPin1 = 10;  // Sensor 1 (Bin Level)
const int trigPin2 = 4;   // Sensor 2 (Door Control)
const int echoPin2 = 5;   // Sensor 2 (Door Control)
const int servoPin = 8;   // Servo Motor
const int ledPin1 = 7;    // Close / Full (Red)
const int ledPin2 = 12;   // Medium       (Yellow)
const int ledPin3 = 11;   // Far / Empty  (Green)

// --- CALIBRATION SETTINGS (UPDATED) ---
const int DIST_FULL  = 5;  // Distance when bin is FULL (Trash is 5cm from top)
const int DIST_EMPTY = 24; // Distance when bin is EMPTY (Bottom is 24cm away)
const int DOOR_THRESHOLD = 20; // Open door if hand is closer than 20cm

// Variables
long duration1, duration2; 
int distance1, distance2;  
int fillPercentage;
Servo servoMotor;

// Timer variables
unsigned long previousMillis = 0;
const long interval = 2000; 

// Servo State Tracking (Prevents jittering)
bool isDoorOpen = false;

void setup() {
  Serial1.begin(9600);
  Serial.begin(9600);
  Serial.println("Smart Bin Initializing...");

  pinMode(trigPin1, OUTPUT);
  pinMode(echoPin1, INPUT);
  
  pinMode(trigPin2, OUTPUT);
  pinMode(echoPin2, INPUT);
  
  pinMode(ledPin1, OUTPUT);
  pinMode(ledPin2, OUTPUT);
  pinMode(ledPin3, OUTPUT);

  servoMotor.attach(servoPin);
  servoMotor.write(0); // Start with door closed

  lcd.begin();      
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Smart Bin System");
  delay(2000); 
  lcd.clear();
}

void loop() {
  // ==========================================
  // PART A: DOOR CONTROL (Runs fast)
  // ==========================================
  
  digitalWrite(trigPin2, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin2, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin2, LOW);

  // Added timeout (30000 microseconds = 30ms) to prevent freezing
  duration2 = pulseIn(echoPin2, HIGH, 30000); 
  
  // Calculate distance only if we got a reading
  if (duration2 == 0) {
    distance2 = 999; // No echo? Assume nothing is there
  } else {
    distance2 = duration2 * 0.034 / 2;
  }

  // --- Servo Logic ---
  if (distance2 > 0 && distance2 < DOOR_THRESHOLD) {
    // Only write if the door isn't already open (Saves servo life)
    if (!isDoorOpen) {
      servoMotor.write(90); // OPEN LID
      isDoorOpen = true;
      delay(300); // Give it time to move
    }
  } else {
    // Only write if the door isn't already closed
    if (isDoorOpen) {
      servoMotor.write(0);  // CLOSE LID
      isDoorOpen = false;
      delay(300); // Give it time to move
    }
  }
  
  delay(50); // Stability delay

  // ==========================================
  // PART B: BIN LEVEL (Runs every 2 seconds)
  // ==========================================
  
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;

    // --- 1. Measure Distance (Sensor 1) ---
    digitalWrite(trigPin1, LOW);
    delayMicroseconds(2);
    digitalWrite(trigPin1, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin1, LOW);
  
    // Added timeout here too
    duration1 = pulseIn(echoPin1, HIGH, 30000); 
    
    if (duration1 == 0) {
      distance1 = DIST_EMPTY; // Default to empty if sensor fails
    } else {
      distance1 = duration1 * 0.034 / 2;
    }
  
    // --- 2. Calculate Fill Percentage ---
    // constrain ensures we don't get negative numbers or numbers > 100
    int constrainedDist = constrain(distance1, DIST_FULL, DIST_EMPTY);
    
    // MAP LOGIC: 
    // If distance is 5cm (DIST_FULL) -> 100%
    // If distance is 24cm (DIST_EMPTY) -> 0%
    fillPercentage = map(constrainedDist, DIST_FULL, DIST_EMPTY, 100, 0);
  
    // --- 3. Update LEDs ---
    digitalWrite(ledPin1, LOW);
    digitalWrite(ledPin2, LOW);
    digitalWrite(ledPin3, LOW);
  
    if (fillPercentage >= 80) {
      digitalWrite(ledPin1, HIGH); // Red
    } 
    else if (fillPercentage >= 40) {
      digitalWrite(ledPin2, HIGH); // Yellow
    } 
    else {
      digitalWrite(ledPin3, HIGH); // Green
    }
  
    // --- 4. Update LCD ---
    lcd.setCursor(0, 0);
    lcd.print("Level: ");
    lcd.print(fillPercentage);
    lcd.print("%      "); // Spaces clear leftover characters
  
    lcd.setCursor(0, 1);
    lcd.print("Dist: ");
    lcd.print(distance1);
    lcd.print(" cm     ");
  
    // --- 5. Send Data to ESP32 ---
    Serial1.println(fillPercentage);
    
    // Debug
    Serial.print("Dist: ");
    Serial.print(distance1);
    Serial.print("cm | Fill: ");
    Serial.print(fillPercentage);
    Serial.println("%");
  }
}
