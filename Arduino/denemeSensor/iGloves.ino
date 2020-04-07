// Define Touch Sensor TTP223B
int sensor1 = 2;
int sensor2 = 3;
int sensor3 = 2;
int sensor4 = 3;
int sensor5 = 4;
int sensor6 = 5;
int sensor7 = 6;
int sensor8 = 7;
int sensor9 = 8;
int sensor10 = 9;
int sensorValue1 = 0;
int sensorValue2 = 0;
int sensorValue3 = 0;
int sensorValue4 = 0;
int sensorValue5 = 0;
int sensorValue6 = 0;
int sensorValue7 = 0;
int sensorValue8 = 0;
int sensorValue9 = 0;
int sensorValue10 = 0;
int ledGreen = 13;
int ledBlue = 12;
int ledRed = 11;

int count = 0;


void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  pinMode(sensor1, INPUT);
  pinMode(sensor2, INPUT);
  pinMode(sensor3, INPUT);
  pinMode(sensor4, INPUT);
  pinMode(sensor5, INPUT);
  pinMode(sensor6, INPUT);
  pinMode(sensor7, INPUT);
  pinMode(sensor8, INPUT);
  pinMode(sensor9, INPUT);
  pinMode(sensor10, INPUT);

  pinMode(ledGreen, OUTPUT);
  pinMode(ledBlue, OUTPUT);
  pinMode(ledRed, OUTPUT);
  Serial.println("Started...");

}

void loop() {
  // put your main code here, to run repeatedly:
  sensorValue1 = digitalRead(sensor1);
  sensorValue2 = digitalRead(sensor2);
  sensorValue3 = digitalRead(sensor3);
  sensorValue4 = digitalRead(sensor4);
  sensorValue5 = digitalRead(sensor5);
  sensorValue6 = digitalRead(sensor6);
  sensorValue7 = digitalRead(sensor7);
  sensorValue8 = digitalRead(sensor8);
  sensorValue9 = digitalRead(sensor9);
  sensorValue10 = digitalRead(sensor10);

  //Serial.println(sensorValue);
  //Serial.println(count);
  digitalWrite(ledRed, LOW);
  digitalWrite(ledBlue, LOW);
  digitalWrite(ledGreen, LOW);
/*
  if (sensorValue1 == 1) {
    count++;

    if (count % 3 == 1) {
      digitalWrite(ledRed, HIGH);


    } else if (count % 3 == 2) {
      digitalWrite(ledRed, HIGH);
      digitalWrite(ledBlue, HIGH);
    } else if (count % 3 == 0) {
      digitalWrite(ledRed, HIGH);
      digitalWrite(ledBlue, HIGH);
      digitalWrite(ledGreen, HIGH);


    }
*/



  }
  delay(250);

}
