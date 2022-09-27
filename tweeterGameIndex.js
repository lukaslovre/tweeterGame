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
  /*
  const tweet = {
    user: {
      profile_image_url:
        "https://pbs.twimg.com/profile_images/1380530524779859970/TfwVAbyX_normal.jpg",
      username: "POTUS",
      name: "President Biden",
      id: "1349149096909668363",
    },
    tweet: {
      id: "1573039438716108800",
      text:
        "Today I met with President Marcos of the Philippines.\n" +
        " \n" +
        "Our nations' relationship is rooted in democracy, common history, and people-to-people ties, including millions of Filipino-Americans who enrich our nation.\n" +
        " \n" +
        "Our alliance is strong and enduring.",
      created_at: "10:00 pm · September 22nd 2022",
      images: ["https://pbs.twimg.com/media/FdSPB3XWIAE3fo3.jpg"],
    },
  };
  */
  res.render("trueFalseMode", { tweet });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

// test ovo je novi komentar
