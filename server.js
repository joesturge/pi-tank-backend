const express = require('express')
const path = require('path')
const bodyParser = require('body-parser');
const app = express()
const port = 80

const public = process.argv[2];

if (!public) {
  console.log(`ERROR - Please specify a static resource path!`);
  process.exit(1);
}

app.use(bodyParser.json());

app.use(express.static(path.resolve(public)));

app.post("/control", (request, response) => {
  console.log(request.body);
  response.status(200).end();
});

app.listen(port, () => console.log(`Pi Tank Running!`));
