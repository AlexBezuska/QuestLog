#! /usr/bin/env node

const fs = require("fs");
const path = require("path");
const request = require('sync-request');
const parser = require('xml2json');
const moment = require("moment");
const he = require("he");
const _ = require('lodash');
const questLogPost = require("../lib/quest-log-post");

const now = new Date();

const args = process.argv.slice(2);
const url = args[0] + "/api/read";

var currentPage = 0;
const perPage = 50;
var totalPosts = 0;
var posts = [];

if (args[0]) {
  totalPosts = getTotal();
  getAllPosts();
} else {
  console.log("A tumblr blog url is required. ex:\n npx quest-log-import-tumblr https://teriyaki-waffles.tumblr.com")
}


function getAllPosts() {

  var timesToRun = Math.ceil(totalPosts / perPage);
  for (var i = 0; i < timesToRun; i++) {
    getSetOfPosts(perPage);
    if (i === timesToRun - 1) {

      console.log(`added ${posts.length} to the array!`);
      createMarkdownFiles(posts);
      fs.writeFileSync("./tumblr-posts.json", JSON.stringify(posts, null, 2));
    }
  }
}

function getTotal() {
  var res = request('GET', url);
  var json = JSON.parse(parser.toJson(res.body));
  console.log("totalPosts", json.tumblr.posts.total);
  return json.tumblr.posts.total;
}

function getSetOfPosts(quantity) {
  var start = currentPage * perPage;
  var end = start + perPage;
  var query = `${url}?num=${perPage}&start=${start}`;
  console.log(query);
  console.log(`asking for posts between ${start} and ${end}...`);
  var res = request('GET', query);
  var json = JSON.parse(parser.toJson(res.body), null, 2);
  addPosts(json);
  currentPage++;
}

function addPosts(data) {
  data.tumblr.posts.post.map(function(post) {
    if (!post["reblogged-from-url"]) {
      posts.push(post);
    }
  });
}

function createMarkdownFiles(posts) {
  var postsCreated = 0;
  posts.map(function(post) {
    var postData = createPostContent(post);
    questLogPost.create(createPostContent(post));
    postsCreated++;
  });
  console.log(`\nTumblr import complete, created ${postsCreated} new Quest Log posts!`);
}

function createPostContent(tumblrPost) {

  var postDate = new Date(tumblrPost["unix-timestamp"] * 1000);
  var postData = {
    "date": postDate.toISOString(),
    "year": moment(postDate).format("YYYY"),
    "month": moment(postDate).format("MM"),
    "day": moment(postDate).format("DD"),
    "time": moment(postDate).format('HH.mm.ss'),
    "title": tumblrPost["regular-title"] || "",
    "categories": [],
    "tags": tumblrPost.tag || [],
    "content": "",
    "coverPhoto": "",
    "coverPhotoAlt": "",
    "imported-from": "Tumblr",
    "import-date": now.toISOString(),
    "tumblr-id": tumblrPost.id,
    "tumblr-url": tumblrPost["url-with-slug"],
    "tumblr-type": tumblrPost.type

  };

  if (tumblrPost.type === "photo") {
    postData.content += tumblrPost["photo-caption"] || "";
    postData.coverPhoto = tumblrPost["photo-url"][0]["$t"] || "";
    postData.coverPhotoAlt = stripHTML(tumblrPost["photo-caption"]);
  } else if (tumblrPost.type === "video") {
    postData.content += tumblrPost["video-player"][0];
    postData.content += tumblrPost["video-caption"];
  } else if (tumblrPost.type === "answer") {
    postData.title = tumblrPost["question"];
    postData.content += tumblrPost["answer"];
  }
  postData.content += tumblrPost["regular-body"] || "";
  postData.title = improvisePostTitle(postData);
  return postData;
}


function improvisePostTitle(postData) {
  var newTitle = postData.title;
  if (!postData.title) {
    newTitle = truncateTitle(postData.content, 24);
  }
  return stripHTML(newTitle);
}

function truncateTitle(title, charLength) {
  return _.truncate(title, {
    'length': charLength,
    'separator': ' '
  });
}


function stripHTML(str) {
  var stripedHtml = str.replace(/<[^>]+>/g, '');
  var decoded = he.decode(stripedHtml);
  var sanitzed = decoded.replace(/[^a-z0-9áéíóúñü \.,_-]/gim, "");
  return sanitzed.trim();
}

// WIP
//function getYoutubeTitle(){
//   https://www.youtube.com/embed/TfG2J3FYyJ0?feature=oembed&amp;enablejsapi=1&amp;origin=https://safe.txmblr.com&amp;wmode=opaque
//   var title;
//   return title;
// }