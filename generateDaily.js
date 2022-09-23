const fs = require("fs");
const { shuffle } = require("./jsTools");
const { getUserTweet } = require("./getTweet");
const { getUserById } = require("./getUser");
const { blurImages } = require("./tweetTools");

const generateDaily = async () => {
  const allUsers = JSON.parse(fs.readFileSync("json_files/users.json")).users;
  shuffle(allUsers);
  const tweets = [];
  const users = [];
  for (let i = 0; i < allUsers.length; i++) {
    const id = allUsers[i];
    const tweet = await getUserTweet(id, Date.now() - 24 * 60 * 60 * 1000);
    if (tweet === undefined) continue;
    await blurImages(tweet);
    tweets.push(tweet);
    users.push(allUsers[i]);
    console.log(tweets.length + "/5");
    if (tweets.length === 5) {
      break;
    }
  }
  for (let i = users.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [users[i], users[j]] = [users[j], users[i]];
  }
  const usersInfo = [];
  for (let i = 0; i < users.length; i++) {
    const user = await getUserById(users[i]);
    usersInfo.push(user);
  }
  const jsonOut = {
    generated: JSON.stringify(Date.now()),
    users: usersInfo,
    tweets: tweets,
  };
  fs.writeFile(
    "json_files/daily.json",
    JSON.stringify(jsonOut, null, 2),
    (e) => {}
  );
  console.log("Done!");
};

generateDaily();
