const mongoose = require("mongoose");
const fs = require("fs");
const { shuffle } = require("./jsTools");
const { getUserTweet } = require("./getTweet");
const { getUserById, getFollowingById } = require("./getUser");

const uri =
  "mongodb+srv://dopusteniUserIdeNaprijed:c2YPpl3OCtvupwCE@tweetergamecluster.4ckpknc.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const TrueFalseSchema = new mongoose.Schema({
  tweet: {
    id: String,
    text: String,
    created_at: String,
    images: [],
  },
  user: {
    id: String,
    name: String,
    username: String,
    profile_image_url: String,
  },
  next_id: mongoose.ObjectId,
});

const TrueFalse = mongoose.model("TrueFalse", TrueFalseSchema);

const bearerToken =
  "AAAAAAAAAAAAAAAAAAAAADvmhAEAAAAAa0k26B2VBDjw%2BAvdwjk5vM%2BuF%2Bg%3DBHAv5AsHzLbdNpxmL0qZmg1pDUtkI9nvOS23bzwuUrFCmfMAPm";

const options = {
  headers: {
    "User-Agent": "v2UserTweetsJS",
    authorization: `Bearer ${bearerToken}`,
  },
};

const generateTrueFalse = async () => {
  const users = JSON.parse(fs.readFileSync("json_files/users.json")).users;
  shuffle(users);
  const answer = Math.random() <= 0.5;
  console.log(answer);
  let userInfo, tweetInfo;
  for (let i = 0; i < users.length; i++) {
	console.log(i);
    const author = users[i];
    if (answer === true) {
      const tweet = await getUserTweet(author);
      if (tweet === undefined) continue;
      if (tweet === 429) return;
      userInfo = await getUserById(author);
      if (userInfo === 429) return;
      tweetInfo = tweet;
      break;
    } else {
      const following = await getFollowingById(author, 100);
      console.log(following);
      if (following === 429) return;
      console.log("ide gas");
      shuffle(following);
      let found = false;
      for (let j = 0; j < following.length; j++) {
        const tweet = await getUserTweet(following[j]);
        if (tweet === 429) return;
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
  const trueFalse = new TrueFalse({
    tweet: {
      id: tweetInfo.id,
      text: tweetInfo.text,
      created_at: tweetInfo.created_at,
      images: tweetInfo.images,
    },
    user: {
      id: userInfo.id,
      name: userInfo.name,
      username: userInfo.username,
      profile_image_url: userInfo.profile_image_url,
    },
    next_id: undefined,
  });
  const res = await trueFalse.save();
  let info = {
    number_of_tweets: 1,
    first_id: res.id,
    last_id: res.id,
  };
  try {
    const newInfo = JSON.parse(
      fs.readFileSync("json_files/trueFalseInfo.json")
    );
    if (!newInfo.number_of_tweets) {
      throw new Error("nema tvitova");
    }
    info = newInfo;
    const last = await TrueFalse.findById(info.last_id);
    last.next_id = res.id;
    await last.save();
    info.last_id = res.id;
    info.number_of_tweets++;
  } catch (e) {}
  fs.writeFile(
    "json_files/trueFalseInfo.json",
    JSON.stringify(info, null, 2),
    (e) => {}
  );
  console.log("Done!");
};

generateTrueFalse().then(() => {
  mongoose.connection.close();
});
