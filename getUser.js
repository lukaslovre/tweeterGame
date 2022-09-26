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
    return user.body.data;
  } catch (e) {
    throw new Error(`Request failed: ${e}`);
    return undefined;
  }
};

const getFollowingById = async (id) => {
  let next_token = undefined;
  const following = [];
  do {
    const url = `https://api.twitter.com/2/users/${id}/following`;
    const params = next_token ? `pagination_token=${next_token}` : "";
    const resp = await needle("get", url, params, options);
    for (let i = 0; i < resp.body.data.length; i++) {
      following.push(resp.body.data[i].id);
    }
    next_token = resp.body.meta.next_token;
  } while (next_token);
  return following;
};

module.exports = { getUserById, getFollowingById };
