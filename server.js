const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const url = require('url');
const Gpio = require('pigpio').Gpio;

const enableWebSockets = app => {
  app._httpServer = http.createServer(app);
  app._webSocketServers = [];
  app.socket = (pathname, wss) => {
    app._webSocketServers[pathname] = wss;
  }
  app.listen = (...args) => {
    app._httpServer.on('upgrade', function upgrade(request, socket, head) {
      const pathname = url.parse(request.url).pathname;

      if(pathname in app._webSocketServers) {
        app._webSocketServers[pathname].handleUpgrade(request, socket, head, function done(ws) {
          app._webSocketServers[pathname].emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    });
    return app._httpServer.listen(...args);
  };
}

const public = process.argv[2];

if (!public) {
  console.log(`ERROR - Please specify a static resource path!`);
  process.exit(1);
}

const app = express();
enableWebSockets(app);
const port = 80;

const ENA = new Gpio(17, {mode: Gpio.OUTPUT});
const IN1 = new Gpio(27, {mode: Gpio.OUTPUT});
const IN2 = new Gpio(22, {mode: Gpio.OUTPUT});
const IN3 = new Gpio(23, {mode: Gpio.OUTPUT});
const IN4 = new Gpio(24, {mode: Gpio.OUTPUT});
const ENB = new Gpio(18, {mode: Gpio.OUTPUT});

ENA.pwmWrite(0);
ENB.pwmWrite(0);
IN1.digitalWrite(1);
IN2.digitalWrite(0);
IN3.digitalWrite(1);
IN4.digitalWrite(0);

const tankControl = new WebSocket.Server({ port: 3001 });
tankControl.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    if (data.name == "LEFT") {
      if (data.value < 0 ) {
        IN1.digitalWrite(0);
        IN2.digitalWrite(1);
      } else {
        IN1.digitalWrite(1);
        IN2.digitalWrite(0);
      }
      ENA.pwmWrite(Math.abs(data.value));
    } else if (data.name == "RIGHT") {
      if (data.value < 0) {
        IN3.digitalWrite(0);
        IN4.digitalWrite(1);
      } else {
        IN3.digitalWrite(1);
        IN4.digitalWrite(0);
      }
      ENB.pwmWrite(Math.abs(data.value));
    }
  });
});

app.use(express.static(path.resolve(public)));

app.post("/controlSocket", tankControl);

app.listen(port, () => console.log(`Pi Tank Running!`));
