const needle = require("needle");
const fs = require("fs");
const moment = require("moment");

const bearerToken =
  "AAAAAAAAAAAAAAAAAAAAADvmhAEAAAAAa0k26B2VBDjw%2BAvdwjk5vM%2BuF%2Bg%3DBHAv5AsHzLbdNpxmL0qZmg1pDUtkI9nvOS23bzwuUrFCmfMAPm";

const options = {
  headers: {
    "User-Agent": "v2UserTweetsJS",
    authorization: `Bearer ${bearerToken}`,
  },
};

const getUserTweets = async (id) => {
  const params = {
    max_results: 30,
    "tweet.fields": "created_at",
    expansions: "author_id",
  };
  const tweets = [];
  const url = `https://api.twitter.com/2/users/${id}/tweets`;
  try {
    const resp = await needle("get", url, params, options);
    const allTweets = resp.body.data;
    //console.log(allTweets);
    for (let i = 0; i < allTweets.length; i++) {
      if (allTweets[i].text.startsWith("RT ")) continue;
      if (allTweets[i].text.startsWith("@")) continue;
      if (
        new RegExp(
          "([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?"
        ).test(allTweets[i].text)
      )
        continue;
      const timeSince = Date.now() - Date.parse(allTweets[i].created_at);
      if (timeSince >= 24 * 60 * 60 * 1000) break;
      //console.log(allTweets[i].created_at);
      //console.log(timeSince);
      tweets.push(allTweets[i]);
    }
    return tweets;
  } catch (e) {
    throw new Error(`Request failed: ${e}`);
    return [];
  }
};

const getUserTweet = async (id) => {
  const tweets = await getUserTweets(id);
  if (tweets.length === 0) {
    return undefined;
  }
  const index = Math.floor(Math.random() * tweets.length);
  return tweets[index];
};

const getUserById = async (id) => {
  try {
    const url = `https://api.twitter.com/2/users/${id}`;
    const user = await needle(
      "get",
      url,
      "user.fields=profile_image_url",
      options
    );
    return user.body.data;
  } catch (e) {
    throw new Error(`Request failed: ${e}`);
    return undefined;
  }
};

const generateDaily = async () => {
  const allUsers = JSON.parse(fs.readFileSync("json_files/users.json")).users;
  for (let i = allUsers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allUsers[i], allUsers[j]] = [allUsers[j], allUsers[i]];
  }
  const tweets = [];
  const users = [];
  for (let i = 0; i < allUsers.length; i++) {
    const id = allUsers[i];
    const tweet = await getUserTweet(id);
    if (tweet === undefined) continue;
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
  const tweetsInfo = [];
  for (let i = 0; i < users.length; i++) {
    const user = await getUserById(users[i]);
    usersInfo.push(user);
  }
  for (let i = 0; i < tweets.length; i++) {
    tweetsInfo.push({
      id: tweets[i].id,
      text: tweets[i].text,
      created_at: moment(tweets[i].created_at).format("hh:mm a · MMMM Do YYYY"),
    });
  }
  const jsonOut = {
    generated: JSON.stringify(Date.now()),
    users: usersInfo,
    tweets: tweetsInfo,
  };
  fs.writeFile(
    "json_files/daily.json",
    JSON.stringify(jsonOut, null, 2),
    (e) => {}
  );
  console.log("Done!");
};

generateDaily();
