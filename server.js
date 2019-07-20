const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 80;
const Gpio = require('pigpio').Gpio;
const public = process.argv[2];

if (!public) {
  console.log(`ERROR - Please specify a static resource path!`);
  process.exit(1);
}

const ENA = new Gpio(17, {mode: Gpio.OUTPUT});
const IN1 = new Gpio(24, {mode: Gpio.OUTPUT});
const IN2 = new Gpio(22, {mode: Gpio.OUTPUT});
const IN3 = new Gpio(23, {mode: Gpio.OUTPUT});
const IN4 = new Gpio(24, {mode: Gpio.OUTPUT});
const ENB = new Gpio(18, {mode: Gpio.OUTPUT});

ENA.pwmWrite(0);
ENB.pwmWrite(0);
IN1.digitalWrite(0);
IN2.digitalWrite(0);
IN3.digitalWrite(0);
IN4.digitalWrite(0);

app.use(bodyParser.json());

app.use(express.static(path.resolve(public)));

app.post("/control", (request, response) => {
  if (request.body.name == "LEFT") {
    ENA.pwmWrite(request.body.value);
  } else if (request.body.name == "RIGHT") {
    ENB.pwmWrite(request.body.value);
  }
  response.status(200).end();
});

app.listen(port, () => console.log(`Pi Tank Running!`));
