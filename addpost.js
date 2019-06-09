var fs = require("fs");
var path = require("path");
var handlebars = require("handlebars");
var moment = require("moment");

var emptyPost = fs.readFileSync("src/pages/blank-post.hbs", "utf-8");
var date = new Date();
var time = moment(date).format('HH.mm.ss');

const args = process.argv.slice(2);
var postArgs = {};
if (args[0] == "today") {
  postArgs.year = moment(date).format("YYYY");
  postArgs.month = moment(date).format("MM");
  postArgs.day = moment(date).format("DD");
  postArgs.title = args[1];
} else {
  postArgs.year = args[0];
  postArgs.month = args[1];
  postArgs.day = args[2];
  postArgs.title = args[3];
}

var defaults = {
  "year": postArgs.year,
  "month": postArgs.month,
  "day": postArgs.day,
  "time": time.replace(/\./g, ':') + "-04:00",
  "title": postArgs.title || "new post",
  "categories": [],
  "tags": [],
  "content": "post content here"
}

var yearFolder = `./src/posts/${postArgs.year}/`;
var monthFolder = `./src/posts/${postArgs.year}/${postArgs.month}/`;
var titleJoined = defaults.title.replace(/\s+/g, '-').toLowerCase();
var fileName = `${postArgs.year}-${postArgs.month}-${postArgs.day}-${time}-${titleJoined}.markdown`;



var content = renderFromExternalTemplate(emptyPost, defaults);
makeDirIfNotExist(yearFolder);
makeDirIfNotExist(monthFolder);
fs.writeFileSync(monthFolder + fileName, content);
console.log("New post markdown file created in:", monthFolder + fileName);


function renderFromExternalTemplate(template, data) {
  var template = handlebars.compile(template);
  return template(data);
}

function makeDirIfNotExist(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
}