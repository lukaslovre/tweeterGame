const needle = require("needle");

const bearerToken =
  "AAAAAAAAAAAAAAAAAAAAADvmhAEAAAAAa0k26B2VBDjw%2BAvdwjk5vM%2BuF%2Bg%3DBHAv5AsHzLbdNpxmL0qZmg1pDUtkI9nvOS23bzwuUrFCmfMAPm";

const options = {
  headers: {
    "User-Agent": "tweeterGame",
    authorization: `Bearer ${bearerToken}`,
  },
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
    if (user.statusCode === 429) {
      console.log('Too many user requests!');
      return undefined;
    }
    console.log(user.body);
    return user.body.data;
  } catch (e) {
    throw new Error(`Request failed: ${e}`);
    return undefined;
  }
};

const getFollowingById = async (id, limit = 0) => {
    let next_token = undefined;
    const following = [];
    do {
        const url = `https://api.twitter.com/2/users/${id}/following`;
        const params = "max_results=100&" + (next_token?`pagination_token=${next_token}`:"");
        const resp = await needle("get", url, params, options);
        console.log(resp);
        if (resp.statusCode === 429) {
          console.log('Too many following requests!');
          return 429;
        }
        if (resp.body.meta.result_count === 0) return [];
        for (let i = 0 ; i < resp.body.data.length ; i++) {
            following.push(resp.body.data[i].id);
            if (limit && following.length === limit) return following;
        }
        next_token = resp.body.meta.next_token;
    } while (next_token);
    return following;
}

module.exports = { getUserById, getFollowingById };
