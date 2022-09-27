const mongoose = require("mongoose");
const fs = require("fs");

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

const getTrueFalse = async () => {
  const info = JSON.parse(fs.readFileSync("trueFalseInfo.json"));
  if (info.number_of_tweets === 0) {
    console.log("nema tvitova");
    return { status: 503 };
  }
  const id = info.first_id;
  const entry = await TrueFalse.findById(id);
  const res = {
    tweet: entry.tweet,
    user: entry.user,
  };
  info.first_id = entry.next_id;
  info.number_of_tweets--;
  console.log(entry._id);
  await TrueFalse.deleteOne({ _id: entry._id }).then();
  fs.writeFile("trueFalseInfo.json", JSON.stringify(info, null, 2), (e) => {});
  console.log(res);
  return res;
};

//getTrueFalse();
module.exports = { getTrueFalse };
