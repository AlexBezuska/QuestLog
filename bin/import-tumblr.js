#! /usr/bin/env node

const fs = require("fs");
const path = require("path");
const request = require('sync-request');
const parser = require('xml2json');
const moment = require("moment");
const he = require("he");
const _ = require('lodash');
const async = require('async');
const metadata = require('html-metadata');
const getUrls = require('get-urls');

const config = require(path.join(__dirname, "../config.json"));
const src = path.join(".", config.src);

const questLogPost = require("../lib/quest-log-post");

const now = new Date();

const args = process.argv.slice(2);
const url = args[0] + "/api/read";

var currentPage = 0;
const perPage = 50;
var totalPosts = 0;
var posts = [];
var postsConverted = [];
var imageUrls = [];

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
      console.log(`Found ${posts.length} posts total (excuding reblogged posts from other authors).`);
      console.log("write the file JSON!");
      fs.writeFileSync("./tumblr-posts.json", JSON.stringify(posts, null, 2));
      postsConverted = convertPosts(posts);
      console.log("write the file JSON!");
      fs.writeFileSync("./converted-tumblr-posts.json", JSON.stringify(postsConverted, null, 2));
      downloadImages(imageUrls);
      //videoPostTitleFix(function() {

      createMarkdownFiles(postsConverted);

      //  });
    }
  }
}

// function getAllVideoPosts(posts) {
//   return posts.filter(function(post) {
//     if (!post["regular-title"] && post["video-source"]) {
//       return true;
//     }
//   });
// }
//
// function videoPostTitleFix(callback) {
//   var videoPosts = getAllVideoPosts(posts);
//
//   async.forEach(videoPosts, (post, callback) => {
//     var url = post["video-source"];
//     metadata(url, (error, metadata) => {
//       post["regular-title"] = stripHTML(metadata.general.title);
//       console.log(`post["regular-title"]`, post["regular-title"]);
//       callback();
//     });
//   }, function(err) {
//     console.log('iterating done');
//   });
// }


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


function createMarkdownFiles(postsConverted) {
  var postsCreated = 0;
  postsConverted.map(function(post) {
    questLogPost.create(post);
    postsCreated++;
  });
  console.log(`\nTumblr import complete, created ${postsCreated} new Quest Log posts!`);

  fs.writeFileSync("./tumblr-images.json", JSON.stringify(imageUrls, null, 2));
}

function convertPosts(posts) {
  return posts.map((post) => {
    return convertPost(post);
  });
}

function convertPost(tumblrPost) {
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
    var coverPhoto = tumblrPost["photo-url"][0]["$t"];
    console.log("===================================================\n", coverPhoto);
    postData.coverPhoto = localizeImageUrl(coverPhoto, postData) || "";
    addImageUrl(coverPhoto, postData);

    postData.coverPhotoAlt = stripHTML(tumblrPost["photo-caption"]);
  } else if (tumblrPost.type === "video") {
    postData.content += tumblrPost["video-player"][0];
    postData.content += tumblrPost["video-caption"];
  } else if (tumblrPost.type === "answer") {
    postData.title = tumblrPost["question"];
    postData.content += tumblrPost["answer"];
  } else if (tumblrPost.type === "link") {
    postData.title = tumblrPost["link-text"];
    postData.content += `<a href="${tumblrPost["link-url"]}">${tumblrPost["link-text"]}</a>`;
    postData.content += tumblrPost["link-description"];
  }
  postData.content += tumblrPost["regular-body"] || "";
  Array.from(getUrls(postData.content)).map((url) => {
    if (url.includes(".jpg") || url.includes(".png") || url.includes(".gif") || url.includes(".svg")) {
      addImageUrl(url, postData);
      postData.content = replaceAll(postData.content, url, localizeImageUrl(url, postData));
    }
  });

  postData.title = improvisePostTitle(postData);
  return postData;
}


function replaceAll(target, search, replacement) {
  return target.split(search).join(replacement);
}

function addImageUrl(url, postData) {
  imageUrls.push({
    "remote": url,
    "local": localizeImageUrl(url, postData)
  });
}

function localizeImageUrl(url, postData) {
  var filename = url.substring(url.lastIndexOf('/') + 1);
  return path.join("/images", postData.year, postData.month, filename);
}

function improvisePostTitle(postData) {
  var newTitle = postData.title;
  if (!postData.title) {
    newTitle = `Post from ${moment(postData.date).format('MMMM Do, YYYY')}`
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

function downloadImages(imageUrls) {
  imageUrls.map((image) => {
    downloadImage(image.remote, image.local);
  })
}

function downloadImage(url, destination) {
  var fullpath = path.join(src, destination);
  if (fs.existsSync(fullpath)) {
    console.log(`The image ${fullpath} has already been downloaded, skipping.`);
    return;
  }
  var folder = fullpath.substring(0, fullpath.lastIndexOf('/'));
  var image = request('GET', url);
  fs.mkdirSync(folder, {
    recursive: true
  });
  if (image) {
    fs.writeFileSync(fullpath, image.getBody());
    console.log(`Image saved to ${fullpath}`);
  } else {
    console.log(`Error with ${url} please check the url.`);
  }
}