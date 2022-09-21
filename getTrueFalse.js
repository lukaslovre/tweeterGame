const needle = require("needle");
const fs = require("fs");
const moment = require("moment");
const { shuffle } = require("./jsTools");
const { getUserTweet } = require("./getTweet");
const { getUserById, getFollowingById } = require("./getUser");

const bearerToken =
  "AAAAAAAAAAAAAAAAAAAAADvmhAEAAAAAa0k26B2VBDjw%2BAvdwjk5vM%2BuF%2Bg%3DBHAv5AsHzLbdNpxmL0qZmg1pDUtkI9nvOS23bzwuUrFCmfMAPm";

const options = {
  headers: {
    "User-Agent": "v2UserTweetsJS",
    authorization: `Bearer ${bearerToken}`,
  },
};

const getTrueFalse = async () => {
  const users = JSON.parse(fs.readFileSync("json_files/users.json")).users;
  shuffle(users);
  const answer = Math.random()<=0.5;
  let userInfo, tweetInfo;
  for (let i = 0 ; i < users.length ; i++) {
    const author = users[i];
    if (answer === true) {
      const tweet = await getUserTweet(author);
      if (tweet === undefined) continue;
      userInfo = await getUserById(author);
      tweetInfo = tweet;
      break;
    } else {
      const following = getFollowingById(author);
      shuffle(following);
      let found = false;
      for (let j = 0 ; j < following.length ; j++) {
        const tweet = getUserTweet(following[j]);
        if (tweet === undefined) continue;
        found = true;
        userInfo = await getUserById(author);
        tweetInfo = tweet;
        break;
      }
      if (found) break;
    }
  }
  if (userInfo === undefined || tweetInfo === undefined) return undefined;
  const result = {
    user: userInfo,
    tweet: tweetInfo
  }
  return result;
}