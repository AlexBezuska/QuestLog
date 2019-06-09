#! /usr/bin/env node

const path = require("path");
const copydir = require("copy-dir");
const rootDir = path.join(__dirname, "..");

const srcDir = path.join(rootDir, "src");
const destDir = path.join(rootDir, "dest");

copydir.sync(srcDir, "./src", {});
copydir.sync(destDir, "./dest", {});