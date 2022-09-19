// express
const express = require("express");
const app = express();
const PORT = 8080;

//ivanov dio
const needle = require("needle");
const fs = require("fs");
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const bearerToken =
  "AAAAAAAAAAAAAAAAAAAAADvmhAEAAAAAa0k26B2VBDjw%2BAvdwjk5vM%2BuF%2Bg%3DBHAv5AsHzLbdNpxmL0qZmg1pDUtkI9nvOS23bzwuUrFCmfMAPm";

const options = {
  headers: {
    "User-Agent": "v2UserTweetsJS",
    authorization: `Bearer ${bearerToken}`,
  },
};

const isAuthorCorrect = async (authorID, tweetID) => {
  try {
    const url = `https://api.twitter.com/2/tweets/${tweetID}`;
    const resp = await needle("get", url, "expansions=author_id", options);
    if (resp.body.data.author_id == authorID) return true;
    return false;
  } catch (e) {
    return 400;
  }
};

app.post("/checkauthor", async (req, res) => {
  try {
    console.log(req.body.data);
    const authorID = req.body.data.author_id;
    const tweetID = req.body.data.tweet_id;
    console.log(authorID + " " + tweetID);
    if (authorID === undefined || tweetID === undefined) {
      res.send().status(400);
    } else {
      const result = await isAuthorCorrect(authorID, tweetID);
      if (result === 400) res.send().status(400);
      else res.send({ result: result });
    }
  } catch (e) {
    console.log("problem brate");
    console.log(e);
    res.send().status(400);
  }
});

app.get("/daily", (req, res) => {
  const resp = JSON.parse(fs.readFileSync("daily.json"));
  for (let i = resp.users.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [resp.users[i], resp.users[j]] = [resp.users[j], resp.users[i]];
    j = Math.floor(Math.random() * (i + 1));
    [resp.tweets[i], resp.tweets[j]] = [resp.tweets[j], resp.tweets[i]];
  }
  res.send(resp);
});

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
