const path = require("path");
const args = process.argv.slice(2);
const url = args[0];
const api = "/api/read/json/";
const tumblrJson = require(path.join(url, api));
console.log(tumblrJson);