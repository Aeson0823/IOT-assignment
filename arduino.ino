#include <Adafruit_LiquidCrystal.h>
#include <Servo.h>

const int trigPin = 9;
const int echoPin = 10;
const int ledPin1 = 13; // Close
const int ledPin2 = 12; // Medium
const int ledPin3 = 11; // Far
const int pirPin = 7;   // PIR motion sensor
const int servoPin = 8; // Servo motor

// Distance thresholds for LEDs (cm)
const int LED_WARNING_DISTANCE_1 = 10;
const int LED_WARNING_DISTANCE_2 = 50;
const int LED_WARNING_DISTANCE_3 = 100;

// For percentage scaling
const int MIN_DISTANCE = 10;   // 10 cm → 10%
const int MAX_DISTANCE = 100;  // 100 cm → 100%

long duration;
int distance;
int percentage;

Adafruit_LiquidCrystal lcd_1(0);
Servo servoMotor;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(ledPin1, OUTPUT);
  pinMode(ledPin2, OUTPUT);
  pinMode(ledPin3, OUTPUT);
  pinMode(pirPin, INPUT);

  lcd_1.begin(16, 2);
  lcd_1.print("Distance Meter");

  servoMotor.attach(servoPin);
  servoMotor.write(0); // Initial closed position

  Serial.begin(9600);
}

void loop() {
  // ---- Ultrasonic Distance Measurement ----
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH, 30000);
  distance = duration * 0.034 / 2;

  if (distance < MIN_DISTANCE) distance = MIN_DISTANCE;
  if (distance > MAX_DISTANCE) distance = MAX_DISTANCE;

  percentage = 100 - map(distance, MIN_DISTANCE, MAX_DISTANCE, 10, 100);

  // ---- LCD Display ----
  lcd_1.clear();
  lcd_1.setCursor(0, 0);
  lcd_1.print("Dist: ");
  lcd_1.print(distance);
  lcd_1.print(" cm");

  lcd_1.setCursor(0, 1);
  lcd_1.print("Level: ");
  lcd_1.print(percentage);
  lcd_1.print("%");

  // ---- Serial Output ----
  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.print(" cm  |  ");
  Serial.print("Level: ");
  Serial.print(percentage);
  Serial.println("%");

  // ---- LED Control ----
  digitalWrite(ledPin1, LOW);
  digitalWrite(ledPin2, LOW);
  digitalWrite(ledPin3, LOW);

  if (distance <= LED_WARNING_DISTANCE_1) {
    digitalWrite(ledPin1, HIGH);
  } 
  else if (distance <= LED_WARNING_DISTANCE_2) {
    digitalWrite(ledPin2, HIGH);
  } 
  else if (distance <= LED_WARNING_DISTANCE_3) {
    digitalWrite(ledPin3, HIGH);
  }

  // ---- PIR + Servo Logic ----
  int motionDetected = digitalRead(pirPin);

  if (motionDetected == HIGH && distance >= 10 && distance <= 20) {
    // Motion detected near 10–20 cm → open servo
    servoMotor.write(90);
    Serial.println("Motion detected! Servo opened.");
    delay(2000); // keep open for 2 seconds
  } else {
    // No motion or out of range → close servo
    servoMotor.write(0);
  }

  delay(500);
}
