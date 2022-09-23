const needle = require("needle");
const fs = require("fs");

const bearerToken =
  "AAAAAAAAAAAAAAAAAAAAADvmhAEAAAAAa0k26B2VBDjw%2BAvdwjk5vM%2BuF%2Bg%3DBHAv5AsHzLbdNpxmL0qZmg1pDUtkI9nvOS23bzwuUrFCmfMAPm";

const options = {
  headers: {
    "User-Agent": "tweeterGame",
    authorization: `Bearer ${bearerToken}`
  }
};

const getUsers = async () => {
  const userId = "1570577234838052869";
  const url = `https://api.twitter.com/2/users/${userId}/following`;
  const ids = [];
  try {
    let token = undefined;
    do {
      const params = token ? `pagination_token=${token}` : "";
      const resp = await needle("get", url, params, options);
      if (resp.statusCode != 200) {
        console.log(`${resp.statusCode} ${resp.statusMessage}:\n${resp.body}`);
        break;
      } else {
        for (let i = 0; i < resp.body.data.length; i++) {
          ids.push(resp.body.data[i].id);
        }
        token = resp.body.meta.next_token;
      }
    } while (token);
  } catch (e) {
    console.log(e);
  }
  const users = {
    users: ids,
  };
  fs.writeFile(
    "json_files/users.json",
    JSON.stringify(users, null, 2),
    (e) => {}
  );
};

getUsers();
