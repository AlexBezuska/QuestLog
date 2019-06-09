#! /usr/bin/env node

var fs = require("fs");
var path = require("path");
var handlebars = require("handlebars");
var moment = require("moment");
const _ = require('lodash');

var emptyPost = fs.readFileSync("src/pages/blank-post.hbs", "utf-8");
var date = new Date();

const args = process.argv.slice(2);
let postTitle = args[0];

// if (args[1]) {
//   postDate = args[1];
// }
var postISODate = date.toISOString();
var postYear = moment(date).format("YYYY");
var postMonth = moment(date).format("MM");
var postDay = moment(date).format("DD");
var postTime = moment(date).format('HH.mm.ss');



var defaults = {
  "date": postISODate,
  "postDate": postISODate,
  "title": postTitle || "new post",
  "categories": [],
  "tags": [],
  "content": "post content here"
}

var yearFolder = `./src/posts/${postYear}/`;
var monthFolder = `./src/posts/${postYear}/${postMonth}/`;
var titleJoined = _.kebabCase(defaults.title);
var fileName = `${postYear}-${postMonth}-${postDay}-${postTime}-${titleJoined}.markdown`;


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