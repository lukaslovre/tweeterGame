// express
const express = require("express");
const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static(__dirname + "/public"));

//ivanov dio
const needle = require("needle");
const fs = require("fs");
const bodyParser = require("body-parser");
const { checkAuthor } = require("./checkAuthor");
const { getDaily } = require("./getDaily");

app.post("/checkauthor", checkAuthor);
app.get("/daily", (req, res) => res.send(getDaily()));

// routes
app.get("/", (req, res) => {
  res.render("home");
});
/* ostali tweetovi se zamute i odu iza malo (smanje se, margin gore dole) */
/* tweeteraši zapravo budu isstim redosljedom uvijek, ali ovaj koji se otvori nije gore prvi negod i bi inace bio, crveni trokut ostane na tom otvorenom ak ode u sredinu */

app.get("/tweetGame", async (req, res) => {
  const tweets = getDaily();
  res.render("tweetGame", {
    tweets,
    usersForJs: JSON.stringify(tweets.users),
    tweetsForJs: JSON.stringify(tweets.tweets),
  });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
