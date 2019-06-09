# <img src="https://gitlab.com/AlexBezuska/quest-log/raw/master/src/images/logo.png" width="25"> Quest Log

<img src="https://gitlab.com/AlexBezuska/quest-log/raw/master/src/images/sample-image.png" width="400">

Quest Log is a simple NodeJS CLI + Markdown static blog engine that uses standard Jekyll Markdown format, Handlebars for templating, and features convenient command line tools.

Availble on NPM: [Quest Log](https://www.npmjs.com/package/quest-log)

This repo is on:
[GitLab](https://gitlab.com/AlexBezuska/quest-log) \| [GitHub](https://github.com/AlexBezuska/quest-log)

## Quick Start Guide

-   Create a folder for your blog to live in and navigate inside the folder in your terminal.  
    Example:

```bash
mkdir chilaquiles-are-life-blog
cd chilaquiles-are-life-blog
```

-   Run this command to install the Quest Log npm module:

```bash
npm install quest-log
```

-   Install Quest Log's folder structure into your project:

```bash
npx quest-log-init
```

-   From here you can generate a post using the `npx quest-log-post` command:

```bash
npx quest-log-post "Chilaquiles are a journey for the soul"
```

where everything after `npx quest-log-post` is the title of your new post(in quotes!).  

Now you you should see the path of your new post's markdown file in your terminal, ex:

```bash
New post markdown file created in: ./src/posts/2019/06/2019-06-09-16.12.27-chilaquiles-are-a-journey-for-the-soul.markdown
```

-   Now you can open that file in the text editor of your choice and edit the post's content to wahtever you want to post about!  
     **But before we get posting too much, let's talk about how to view your Quest Log site locally on your computer.**

-   Now that we have a post markdown file created you will need to run Quest Log's build command to generate the static html files you can view in a browser.

    You do this with

    ```bash
     npx quest-log-build
    ```

    The files will magically appear in the `./dest` folder.

### To preview it

This part depends a bit on how you want to do things, if you already have a way you like to use to serve static html files locally you can do that.
But you can't just open `./dest/index.html` because there wll be path issues and your images and other things might wonk out on you.

Even though this is a Node project there is a really simple way to serve a static site locally using Python called `SimpleHTTPServer` and it is pre-installed on macOS and Ubuntu.
Open a new tab in your terminal and run the command (from inside the `./dest` folder):

```bash
cd dest
python -m SimpleHTTPServer 8000
```

### Getting your new Quest Log site on the web

You need to serve the contents of the `./dest` folder.
Be sure:

-   to include all the files in that folder
-   the `index.html` file exists and is in the room of the folder you serve  

I will provide some tips on doing this in a later patch.

## Changing things and making it your own

Make changes in the `./config.json` file to make your Quest Log site your own.

`title` and `subtitle` are used in both metadata and shown on the site itself.
`description` is your search engine description, and 'google-analytics-id' is optional

```json
"title": "Quest Log",
"subtitle": "NodeJS CLI + Markdown static blog engine",
"description": "Quest Log is a NodeJS CLI + Markdown static blog engine that uses standard Jekyll Markdown format, Handlebars for templating, and features convenient command line tools.‬",
"google-analytics-id": "UA-XXXXXX-XX",
```

## How to add additional pages

Pages example `site.json` has a pages area, you can add additional pages like this:
_Note: One page must have the fileName `index.html`, this is the first page when people visit your site._

```json
"pages":[
  {
    "name": "Home",
    "file": "index.html",
    "showInNav": true
  },
  {
    "name": "Portfolio",
    "file": "portfolio.html",
    "showInNav": true
  },
  {
    "name": "Blog",
    "file": "blog.html",
    "showInNav": true
  },
  {
    "name": "Contact",
    "file": "contact.html",
    "showInNav": true
  }
],
```

Each page will require a corresponding Handlebars file of the same name in the `./src/pages/` folder. For example:
if you want a `portfolio.html` page you need to add a `portfolio.hbs` file in `./src/pages/`.

* * *

## Known Bugs

(Help appreciated!)

-   Embedded youtube videos don't work

## Future improvements

(Help appreciated!)

-   Partial handling
    -   The `insertPartials` function in guestlog.js is a bit of a hack. There is probably a better way to handle partials in handlebars, but this works for now.
-   Make post pagination top and bottom optional
-   Add a way to use the `npx quest-log-post` command with a custom date (not today)
