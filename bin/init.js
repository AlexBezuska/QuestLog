#! /usr/bin/env node

const fs = require("fs");
const path = require("path");
const copydir = require("copy-dir");
const rootDir = path.join(__dirname, "..");

const srcDir = path.join(rootDir, "src");
const destDir = path.join(rootDir, "dest");

copydir.sync(srcDir, "./src", {});
copydir.sync(destDir, "./dest", {});
fs.copyFileSync(path.join(rootDir, "quest-log-config.json"), "./quest-log-config.json");
