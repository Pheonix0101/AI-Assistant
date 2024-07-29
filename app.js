const express = require("express");
const axios = require("axios");
const OpenAI = require("openai");
var bodyParser = require("body-parser");
var cors = require('cors')
const fs = require("fs");
require("dotenv").config();

const routes = require("./Routes/askQuestion");
const app = express();
app.use(cors());

// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPEN_API_KEY,
});

const port = process.env.PORT || 9009;

app.use(routes);

app.listen(port, () => {
  console.log(`app is listining on ${port}`);
});
