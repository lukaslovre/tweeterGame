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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/checkauthor", checkAuthor);
app.get("/daily", getDaily);

// kraj ivanov dio

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static(__dirname + "/public"));

// routes
app.get("/", (req, res) => {
  res.render("home");
});
/* ostali tweetovi se zamute i odu iza malo (smanje se, margin gore dole) */
/* tweeteraši zapravo budu isstim redosljedom uvijek, ali ovaj koji se otvori nije gore prvi negod i bi inace bio, crveni trokut ostane na tom otvorenom ak ode u sredinu */

app.get("/tweetGame", (req, res) => {
  const tweets = JSON.parse(fs.readFileSync("json_files/daily.json"));

  //shuffle tweets
  for (let i = tweets.users.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [tweets.users[i], tweets.users[j]] = [tweets.users[j], tweets.users[i]];
    j = Math.floor(Math.random() * (i + 1));
    [tweets.tweets[i], tweets.tweets[j]] = [tweets.tweets[j], tweets.tweets[i]];
  }

  res.render("tweetGame", {
    tweets,
    usersForJs: JSON.stringify(tweets.users),
    tweetsForJs: JSON.stringify(tweets.tweets),
  });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
