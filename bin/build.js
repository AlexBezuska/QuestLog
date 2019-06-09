#! /usr/bin/env node

const fs = require("fs");
const path = require("path");
const marked = require("marked");
const handlebars = require("handlebars");
const copydir = require("copy-dir");
const yamlFront = require("yaml-front-matter");
const moment = require("moment");
const rimraf = require('rimraf');
const _ = require('lodash');

handlebars.registerHelper("raw", function(options) {
  return options.fn(this).replace(/\[\[/g, '{{').replace(/\]\]/g, '}}');
});

const package = require(path.join(__dirname, "../package.json"));
const config = require(path.join(__dirname, "../config.json"));
const site = require(path.join(__dirname, "../site.json"));
site.generator = "Quest Log " + package.version;
const src = path.join(".", config.src);
const dest = path.join(".", config.dest);
let data = {};


makeDirIfNotExist(dest);
rimraf(path.join(dest, "*"), function() {
  buildBlog();
});

function buildBlog() {
  makeDirIfNotExist(path.join(dest, "posts"));

  copydir.sync(path.join(src, "css"), path.join(dest, "css"), {});

  copydir.sync(path.join(src, "images"), path.join(dest, "images"), {});

  copydir.sync(path.join(src, "fonts"), path.join(dest, "fonts"), {});
  copyFavicons();


  data = addPageData(createData());


  data.site.pages.forEach((page) => {
    var pageName = _.kebabCase(page.name);
    var fileName = page.file;
    createPage(pageName, data, path.join(dest, fileName));
  });

  compilePosts(data);
}

function copyFavicons() {
  favicons = ["android-chrome-192x192.png",
    "android-chrome-512x512.png",
    "apple-touch-icon.png",
    "favicon-16x16.png",
    "favicon-32x32.png",
    "favicon.ico",
    "site.webmanifest"
  ];
  favicons.forEach((favicon) => {
    fs.copyFileSync(path.join(src, favicon), path.join(dest, favicon));
  });
}



function addPageData(data) {
  var newData = data;
  newData.site.pages.forEach((page) => {
    if (page.showInNav) {
      var pageName = _.kebabCase(page.name);
      var jsonPath = path.join(src, "pages", pageName + ".json");
      console.log("jsonPath", jsonPath);
      if (fs.existsSync(jsonPath)) {
        newData[_.camelCase(page.name)] = fs.readFileSync(jsonPath);
      }
    }
  });
  return newData;
}

function compilePosts(data) {
  data.posts.forEach((postObject) => {
    compilePost(postObject);
  });
  console.log("- All done -");
}

function compilePost(postObject) {
  var post = getPostMeta(postObject.src);
  post.prev = postObject.prev;
  post.next = postObject.next;

  var data = {
    site: site,
    post: {
      meta: post,
      content: marked(post.__content).replace("<!--more-->", "")
    }
  };

  data.post.meta.dateTime = data.post.meta.date;
  data.post.meta.time = moment(data.post.meta.date).format('hh:mm a');
  data.post.meta.date = moment(data.post.meta.date).format('MMMM Do, YYYY');

  createPage(config.postTemplate, data, dest + postObject.url)
}

function insertPartials(templateName) {
  var completeTemplate = fs.readFileSync(path.join(src, config.templatesDirectory, templateName + ".hbs"), "utf8");

  config.partials.forEach((partial) => {
    var partialTemplate = fs.readFileSync(path.join(src, config.partialsDirectory, partial + ".hbs"), "utf8");
    var partialTag = "{{>tag}}".replace("tag", partial);
    completeTemplate = completeTemplate.replace(partialTag, partialTemplate);
  });
  return completeTemplate;
}

function createPage(templateName, data, outputFileName) {

  var html = renderFromExternalTemplate(insertPartials(templateName), data);
  fs.writeFileSync(outputFileName, html);
}

function renderFromExternalTemplate(template, data) {
  var template = handlebars.compile(template);
  return template(data);
}

function createData() {
  var posts = addNextPrevToFlatPostList(sortPosts(returnFlatPostList(createPostTree()))).reverse();
  console.log(posts.length, "Posts");
  var data = {};
  data.site = site;
  data.featured = onlyFeatured(posts);
  console.log(data.featured.length, " Featured Posts");

  data.posts = posts;
  return data;
}

function onlyCategory(posts, category) {
  return posts.filter((post) => {
    return post.category === category;
  });
}

function onlyFeatured(posts) {
  return posts.filter((post) => {
    return post.featured === true;
  });
}

function addNextPrevToFlatPostList(posts) {
  var list = [];
  for (var i = 0; i < posts.length; i++) {
    var postInfo = {};
    postInfo["title"] = posts[i].title;
    postInfo["featured"] = posts[i].featured;
    postInfo["date"] = posts[i].date;
    postInfo["src"] = posts[i].src;
    postInfo["url"] = posts[i].url;
    postInfo["category"] = posts[i].category;
    postInfo["blurb"] = posts[i].blurb;
    postInfo["coverPhoto"] = posts[i].coverPhoto;
    postInfo["coverPhotoAlt"] = posts[i].coverPhotAlt;
    if (i > 0) {
      var prev = posts[i - 1];
      postInfo["prev"] = {
        title: prev.title,
        date: prev.date,
        url: prev.url,
      };
    }
    if (i < posts.length - 1) {
      var next = posts[i + 1];
      postInfo["next"] = {
        title: next.title,
        date: next.date,
        url: next.url,
      };
    }
    list.push(postInfo);
  }
  return list;
}

function sortPosts(posts) {
  return posts.sort(function(a, b) {
    return a.dateTime - b.dateTime;
  });
}

function returnFlatPostList(tree) {
  var flatPostList = [];
  Object.keys(tree).map((year) => {
    Object.keys(tree[year]).map((month) => {
      tree[year][month].map((post) => {
        var postMarkdownFile = path.join(year, month, post);
        var postMeta = getPostMeta(path.join(src, "posts", postMarkdownFile));
        var blurb = getBlurb(postMeta);
        console.log("postMeta.date", postMeta.date, moment(postMeta.date).format('h:mm a'));
        flatPostList.push({
          title: postMeta.title,
          dateTime: postMeta.date,
          date: moment(postMeta.date).format('MMMM Do, YYYY'),
          time: moment(postMeta.date).format('h:mm a'),
          src: path.join(src, "posts", postMarkdownFile),
          url: path.join("/posts", convertFilename(postMarkdownFile)),
          category: postMeta.category,
          blurb: blurb,
          coverPhoto: postMeta.coverPhoto,
          coverPhotoAlt: postMeta.coverPhotoAlt,
          featured: postMeta.featured
        });
      });
    });
  });
  return flatPostList;
}

function getBlurb(postMeta) {
  return truncate(postMeta.__content, 200).replace("<!--more-->", "");
}


function truncate(string, length) {
  if (string.length > length)
    return string.substring(0, length) + '...';
  else
    return string;
};

function createPostTree() {
  var tree = {};
  getDirectories(path.join(src, "posts")).map((year) => {
    makeDirIfNotExist(path.join(dest, "posts", year)); //FIXME this should not be in here
    tree[year] = {};
    getDirectories(path.join(src, "posts", year)).map((month) => {
      makeDirIfNotExist(path.join(dest, "posts", year, month)); //FIXME this should not be in here
      var filesInMonth = fs.readdirSync(path.join(src, "posts", year, month));
      tree[year][month] = onlyMarkdownFiles(filesInMonth);
    });
  });
  return tree;
}

function getPostMeta(postFile) {
  var text = fs.readFileSync(postFile, "utf8");
  return yamlFront.loadFront(text);
}

function convertFilename(filename) {
  return filename.replace(".markdown", ".html").replace(".markdown", ".html");
}

function getDirectories(path) {
  return fs.readdirSync(path).filter(function(file) {
    return fs.statSync(path + '/' + file).isDirectory();
  });
}

function makeDirIfNotExist(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
}

function onlyMarkdownFiles(files) {
  return files.filter((file) => {
    if (file.includes('._')) {
      return false;
    }
    return file.includes('.markdown');
  });
}