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
  const params_ids = {
    max_results: 30,
    "tweet.fields": "created_at"
  };
  const params_details = {
    expansions: "attachments.media_keys,referenced_tweets.id",
    "tweet.fields": "created_at",
    "media.fields": "url"
  }
  const tweets = [];
  const url = `https://api.twitter.com/2/users/${id}/tweets`;
  try {
    const resp = await needle("get", url, params_ids, options);
    const allTweets = resp.body.data;
    for (let i = 0; i < allTweets.length; i++) {

      //too old
      const timeSince = Date.now() - Date.parse(allTweets[i].created_at);
      if (timeSince >= 24 * 60 * 60 * 1000) break;

      //console.log(allTweets[i].id);
      const url2 = `https://api.twitter.com/2/tweets/${allTweets[i].id}`;
      const response = await needle("get", url2, params_details, options);
      //console.log(response);
      const tweet = await response.body;
      //console.log(tweet);
      //QRT/RT/reply
      if (tweet.data.referenced_tweets !== undefined) continue;

      //videos
      let noVideos = true;
      try {
        for (let j = 0 ; j < tweet.includes.media.length ; j++) {
          if (tweet.includes.media[j].type == "video") noVideos = false;
        }
      } catch (e) {}
      if (noVideos === false) continue;

      const images = [];
      try {
        for (let j = 0 ; j < tweet.includes.media.length ; j++) {
          images.push(tweet.includes.media[j].url);
        }
      } catch (e) {}

      //links
      const tcoCount = (tweet.data.text.match(/t.co/g) || []).length;
      if ((images.length == 0 && tcoCount > 0) || (images.length > 0 && tcoCount > 1)) continue;

      //delete t.co
      if (images.length > 0) {
        const textLength = tweet.data.text.indexOf('t.co') - 9;
        tweet.data.text = tweet.data.text.substring(0, textLength);
      }

      tweets.push({
        id: tweet.data.id,
        text: tweet.data.text,
        created_at: moment(tweet.data.created_at).format("hh:mm a · MMMM Do YYYY"),
        images: images
      });
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
