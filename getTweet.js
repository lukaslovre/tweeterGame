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

const getUserTweets = async (id, since) => {
  const params_ids = {
    max_results: 30,
    "tweet.fields": "created_at"
  };
  const params_details = {
    expansions: "attachments.media_keys,referenced_tweets.id,attachments.poll_ids",
    "tweet.fields": "created_at",
    "media.fields": "url"
  }
  const tweets = [];
  const url = `https://api.twitter.com/2/users/${id}/tweets`;
  try {
    const resp = await needle("get", url, params_ids, options);
    console.log(resp.body);
    if (!resp.body.data) return [];
    const allTweets = resp.body.data;
    for (let i = 0; i < allTweets.length; i++) {

      //too old
      const time = Date.parse(allTweets[i].created_at);
      if (time <= since) break;

      //console.log(allTweets[i].id);
      const url2 = `https://api.twitter.com/2/tweets/${allTweets[i].id}`;
      const response = await needle("get", url2, params_details, options);
      if (response.statusCode === 429) {
        console.log('Too many tweet requests');
        return 429;
      }
      //console.log(response);
      const tweet = await response.body;
      //console.log(tweet);
      //QRT/RT/reply
      if (tweet.data.referenced_tweets !== undefined) continue;

      //polls
      try {
        if (tweet.includes.polls) continue;
      } catch (e) {}

      //videos & GIFs
      let noVideos = true;
      let noGIFs = true;
      try {
        for (let j = 0 ; j < tweet.includes.media.length ; j++) {
          if (tweet.includes.media[j].type == "video") noVideos = false;
          if (tweet.includes.media[j].type == "animated_gif") noGIFs = false;
        }
      } catch (e) {}
      if (noVideos === false || noGIFs === false) continue;

      //const gif = "";
      const images = [];
      try {
        for (let j = 0 ; j < tweet.includes.media.length ; j++) {
          if (tweet.includes.media[j].type == "photo") images.push(tweet.includes.media[j].url);
          //if (tweet.includes.media[j].type == "animated_gif") gif = ;
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

const getUserTweet = async (id, since = 0) => {
    //console.log(id, since);
  const tweets = await getUserTweets(id, since);
  if (tweets === 429) return 429;
  if (tweets.length === 0) {
    return undefined;
  }
  const index = Math.floor(Math.random() * tweets.length);
  return tweets[index];
};

module.exports = { getUserTweet };