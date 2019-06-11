#! /usr/bin/env node

const moment = require("moment");
const questLogPost = require("../lib/quest-log-post");

const now = new Date();
const args = process.argv.slice(2);
let postTitle = args[0];

var postContent = {
  "date": now.toISOString(),
  "year": moment(now).format("YYYY"),
  "month": moment(now).format("MM"),
  "day": moment(now).format("DD"),
  "time": moment(now).format('HH.mm.ss'),
  "title": postTitle || "new post",
  "categories": [],
  "tags": [],
  "content": `This is a sample post created with Quest Log!

  ![Sample inline image](/images/sample-image.png)  
  Photo by [Nirzar Pangarkar](https://unsplash.com/@nirzar) on [Unsplash](https://unsplash.com)
`
};

questLogPost.create(postContent);