const fs = require("fs");
const path = require("path");
const request = require('sync-request');
const parser = require('xml2json');

const args = process.argv.slice(2);
const url = args[0] + "/api/read";

var currentPage = 0;
var perPage = 50;
var totalPosts = getTotal();
var posts = [];

getAllPosts();

function getAllPosts() {
  var timesToRun = Math.ceil(totalPosts / perPage);
  for (var i = 0; i < timesToRun; i++) {
    getSetOfPosts(perPage);
    if (i === timesToRun - 1) {
      console.log(`added ${posts.length} to the array!`);
      fs.writeFileSync("./bin/tumblr-posts.json", JSON.stringify(posts, null, 2));
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
  parsePosts(json);
  currentPage++;
}

function parsePosts(data) {
  data.tumblr.posts.post.map(function(post) {
    posts.push(post);
  });
}



var samplePost = {
  //"id": "184215702871",
  //"url": "https://twoscoopgames.tumblr.com/post/184215702871",
  //"url-with-slug": "https://twoscoopgames.tumblr.com/post/184215702871/we-have-gone-a-new-direction",
  //"type": "regular",
  //"date-gmt": "2019-04-16 01:33:31 GMT",
  //"date": "Mon, 15 Apr 2019 21:33:31",
  "unix-timestamp": "1555378411",
  "slug": "we-have-gone-a-new-direction",
  "regular-title": "We have gone a new direction!",
  "regular-body": "<p>New art style, new gameplay, more variety, and more content. We want to bring you the best Kick Bot possible, that means opening ourselves up to releasing on different platforms.</p><figure class=\"tmblr-full\" data-orig-height=\"179\" data-orig-width=\"320\"><img src=\"https://66.media.tumblr.com/2c69ddaaa104593f45ab37a9037d03fc/tumblr_inline_pq15niETkZ1sh27ku_540.gif\" data-orig-height=\"179\" data-orig-width=\"320\"/></figure><figure class=\"tmblr-full\" data-orig-height=\"179\" data-orig-width=\"320\"><img src=\"https://66.media.tumblr.com/14ddeebf8a3370656969ac7e2e9f8bab/tumblr_inline_pq15n5D1Bq1sh27ku_540.gif\" data-orig-height=\"179\" data-orig-width=\"320\"/></figure><figure class=\"tmblr-full\" data-orig-height=\"179\" data-orig-width=\"320\"><img src=\"https://66.media.tumblr.com/dea172b502dbe152bc87921242f14ac8/tumblr_inline_pq15n402TI1sh27ku_540.gif\" data-orig-height=\"179\" data-orig-width=\"320\"/></figure><p>Sign up for the beta and let us know how you play games! <a href=\"https://t.co/OrSIUo9T21\" title=\"http://bit.ly/kbdxbeta\">http://bit.ly/kbdxbeta </a> <br/></p>",
  "tag": ["kickbotgame", "indie games", "gamedev", "pixel art"]
};
