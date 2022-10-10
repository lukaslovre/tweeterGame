// express
const express = require("express");
const app = express();
const PORT = 8080;

//ivanov dio
const needle = require("needle");
const fs = require("fs");
const bodyParser = require("body-parser");
const { checkAuthor } = require("./checkAuthor");
const { getDaily } = require("./getDaily");
const { getTrueFalse } = require("./getTrueFalse");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static(__dirname + "/public"));

// ROUTES:

app.post("/checkauthor", checkAuthor);
app.get("/daily", (req, res) => res.send(getDaily()));
app.get("/truefalse", (req, res) => res.send(getTrueFalse()));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/tweetGame", async (req, res) => {
  const tweets = getDaily();
  res.render("tweetGame", {
    tweets,
    usersForJs: JSON.stringify(tweets.users),
    tweetsForJs: JSON.stringify(tweets.tweets),
  });
});

app.get("/true-false-mode", async (req, res) => {
  const tweet = await getTrueFalse();
  /*const tweet = {
    tweet: {
      id: "1514008829821861897",
      text: "Oh my gosh I haven’t posted in so long SEND ME SUBMISSIONS PLS INCLUDING PODCAST",
      created_at: "12:33 am · April 13th 2022",
      images: [],
    },
    user: {
      id: "9989862",
      name: "jacksfilms",
      username: "jacksfilms",
      profile_image_url:
        "https://pbs.twimg.com/profile_images/1523106752668966913/tWNV2zbS_normal.jpg",
    },
  };
*/
  res.render("trueFalseMode", { tweet });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
