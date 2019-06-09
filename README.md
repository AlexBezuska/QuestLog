# <img src="/src/images/logo.png" width="40"> Quest Log  

<img src="/src/images/sample-image.png" width="400">



Quest Log is a simple NodeJS CLI + Markdown static blog engine that uses standard Jekyll Markdown format, Handlebars for templating, and features convenient command line tools.

This repo is on:
[GitLab](https://gitlab.com/AlexBezuska/quest-log) \| [GitHub](https://github.com/AlexBezuska/quest-log)

## Quick Start Guide

1.  Download [Quest Log zip file](https://github.com/AlexBezuska/quest-log/archive/master.zip) and extract it's contents into a folder

2.  Navigate inside the folder in your terminal and run this command to download Quest Log's dependencies:
```bash
npm install
```
4.  From here you can generate a post using the `add-post` command:
    *Note: you can use this command in two ways, but we will start with creating a post with today's date. To create a post for a different day see the [Retro-posting section](#retro-posting)*

```bash
npm run add-post today "Hello World"
```

The structure of the command has 3 parts:  
The add-post command: `npm run add-post`  
Telling  Quest Log to use today's date: `today`  
and finally the title of your new post(in quotes): `"Hello World"`  

Now you you should see the path of your new post's markdown file in your terminal, ex:

```bash
New post markdown file created in: ./src/posts/2019/06/2019-06-08-16.33.33-hello-world.markdown
```

5.  Now you can open that file in the text editor of your choice and edit the post's content to wahtever you want to post about!  
    **But before we get posting too much, let's talk about how to view your Quest Log site locally on your computer.**

-   Now that we have a post markdown file created you will need to run Quest Log's build command to generate the static html files you can view in a browser.

    You do this with

    ```bash
     npm start
    ```

    The files will magically appear in the `./dest` folder.

### To preview it

This part depends a bit on how you want to do things, if you already have a way you like to use to serve static html files locally you can do that.
But you can't just open `./dest/index.html` because there wll be path issues and your images and other things might wonk out on you.

Even though this is a Node project there is a really simple way to serve a static site locally using Python called `SimpleHTTPServer` and it is pre-installed on macOS and Ubuntu.
Open a new tab in your terminal and run the command (from inside the `./dest` folder):

```bash
python -m SimpleHTTPServer 8000
```

You can change the port to whatever you like.
I have also included a npm script command if you are okay with using the default post:

```bash
npm run serve
```

### Getting your new Quest Log site on the web

You need to serve the contents of the `./dest` folder.
Be sure:

-   to include all the files in that folder
-   the `index.html` file exists and is in the room of the folder you serve  

I will provide some tips on doing this in a later patch.

## Changing

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

## Retro-posting

If you want to create a new post for a day other than today, you can do that, I won't judge.

```bash
npm run add-post 2019 06 07 "Hello from the past!"
```

The structure of the command has 3 parts:  
The add-post command: `npm run add-post`  
Telling Quest Log the year, month, and day to use (in this specific order, with spaces): `2019 06 07`  
and finally the title of your new post(in quotes): `"Hello from the past!"`

---

## Known Bugs

(Help appreciated!)

-   Needs favicon
-   Embedded youtube videos don't work

## Future improvements

(Help appreciated!)

-   Partial handling
    -   The `insertPartials` function in guestlog.js is a bit of a hack. There is probably a better way to handle partials in handlebars, but this works for now.
-   Make post pagination top and bottom optional
