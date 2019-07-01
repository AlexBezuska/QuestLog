const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const _ = require('lodash');


let configFile = fs.readFileSync(path.join(".","quest-log-config.json"));
let config = JSON.parse(configFile);
const src = path.join(".", config.src);
const emptyPost = fs.readFileSync("src/pages/blank-post.hbs", "utf-8");


/**
 * Creates the folder structure, compiles the handlebars template `./src/pages/blank-post.hbs` and writes a post markdown file into `./src/YEAR/MONTH/`.
 * Makes filesystem changes, edits the `post` object
 */
function create(post) {
  createPostFolders(post);
  var content = renderFromExternalTemplate(emptyPost, post);
  var fullPath = path.join(post.localPath, createPostFileName(post));
  fs.writeFileSync(fullPath, content);
  console.log("New post markdown file created in:\n", fullPath);
}

/**
 * Create the folder structure that the post markdown file will go inside `src/YEAR/MONTH/post.markdown`.
 * Edits the post object to add 'localPath' string for the createPost function to use.
 * Makes filesystem changes, edits the `post` object
 */
function createPostFolders(post) {
  var yearFolder = path.join(src, "posts", post.year);
  makeDirIfNotExist(yearFolder);
  var monthFolder = path.join(yearFolder, post.month);
  makeDirIfNotExist(monthFolder);
  post.localPath = monthFolder;
}

/**
 * Create the filename for a post  `YYYY-MM-DD-HH.mm.ss-title-of-post.markdown`.
 * Returns a string
 */
function createPostFileName(post) {
  return `${post.year}-${post.month}-${post.day}-${post.time}-${_.kebabCase(post.title)}.markdown`;
}

/**
 * Takes a Handlebars template and JSON data and returns raw HTML.
 * Returns a string(HTML)
 */
function renderFromExternalTemplate(template, data) {
  var template = handlebars.compile(template);
  return template(data);
}

/**
 * Checks if a folder exists, and creates it if it does not.
 * Makes filesystem changes
 */
function makeDirIfNotExist(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
    console.log(`Created new folder ${filePath}`);
  }
}

module.exports = {
  create: create
};
