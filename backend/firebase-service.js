var admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://oauthsignin-255519.firebaseio.com"
});

module.exports = admin;
