/** Database setup for BizTime. */

const { Client } = require("pg");

client = new Client({
  user: "christopher",
  password: "Guitar1234!",
  port: 5432,
  database: "biztime",
  host: "/var/run/postgresql",
});

client.connect((err) => {
  if (err) {
    console.error("connection error", err.stack);
  } else {
    console.log("connected");
  }
});

module.exports = client;
