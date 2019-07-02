#! /usr/bin/env node

const fs = require("fs");
const path = require("path");
const copydir = require("copy-dir");
const rootDir = path.join(__dirname, "..");

copydir.sync(path.join(rootDir, "src"), "./src", {});
copydir.sync(path.join(rootDir, "dest"), "./dest", {});
copydir.sync(path.join(rootDir, "partials"), "./partials", {});
fs.copyFileSync(path.join(rootDir, "quest-log-config.json"), "./quest-log-config.json");
fs.copyFileSync(path.join(rootDir, ".init-gitignore"), ".gitignore");
