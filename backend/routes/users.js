var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();
var checkIfAuthenticated = require('../auth-middleware');
var admin = require('../firebase-service');


// Promise helper
// TODO put all doubled functions in one place
function AwaitAsyncPromiseHelper(db) {

  db.getAsync = function (sql, params) {
    var that = this;
    return new Promise(function (resolve, reject) {
      if (!params) params = [];
      that.get(sql, params, function (err, row) {
        if (err)
          reject(err);
        else
          resolve(row);
      });
    });
  };

  db.runAsync = function (sql, params) {
    var that = this;
    return new Promise(function (resolve, reject) {
      if (!params) params = [];
      that.run(sql, params, function (err) {
        if (err)
          reject(err);
        else
          resolve(this.lastID);
      });
    });
  };

  db.allAsync = function (sql, params) {
    var that = this;
    return new Promise(function (resolve, reject) {
      if (!params) params = [];
      that.all(sql, params, function (err, rows) {
        if (err)
          reject(err);
        else
          resolve(rows);
      });
    });
  };

  return db;
}

// TODO put all doubled functions in one place
function close(db) {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Close the database connection.');
  });
}

// TODO put all doubled functions in one place
async function getUserInfo(db, userUid) {
  // find User info (if not found - create user)
  var userInfo = await db.getAsync(`select * from user u where u.google_uid = ?`, [userUid]);
  return userInfo;
}

// update User Preferences
router.get('/preferences/update/:data', checkIfAuthenticated, function (req, res, next) {
  console.log("p: " + req.params['data']);
  updateUserPreferences(req, res);
});

// create/update User
router.get('/createupdate', checkIfAuthenticated, function (req, res, next) {
  createUpdateUser(req, res);
});

// get User Preferences
router.get('/preferences/get', checkIfAuthenticated, function (req, res, next) {
  getUserPreferences(req, res);
});

/* create/select User data */
router.get('/userUid/:userUid', function(req, res, next) {
  let userUid = req.params['userUid'];
  console.log('userUid: ' + userUid);
  let db = new sqlite3.Database('./word.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });

  db.serialize(() => {
    db.get(`SELECT * from user u where u.google_uid = ?`, [userUid], (err, row) => {
      if(err) {
        close(db);
        res.send(err.message);
        return console.log(err.message);
      }
      if(row) {
        close(db);
        // user has found
        res.json(row);
      } else {
          db.run(`INSERT INTO user(google_uid) VALUES(?)`, [userUid], function (err) {
            if (err) {
              close(db);
              return console.log(err.message);
            }
              db.get(`SELECT * from user u where u.id = ?`, [this.lastID], (err, row) => {
                if(err) {
                  res.send('backend db error');
                  close(db);
                  return console.log(err.message);
                }
                console.log('row:' + JSON.stringify(row));
                res.json({'data: ' : row});
                close(db);
                
              })
          });
      }


    })
    


  });



});


// save User? message
router.post('/message', function (req, res) {
  saveUserMessage(req, res);
});

async function saveUserMessage(req, res) {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    req.authToken = req.headers.authorization.split(' ')[1];
  } else {
    req.authToken = null;
  }

  const { email, message } = req.body;
  var data = {};
  try {
    const userInfo = await admin.auth().verifyIdToken(req.authToken);

    console.log('userInfo: ' + JSON.stringify(userInfo));

    data = {email: userInfo['email'], userUid: userInfo['user_id'], message: message};
    
  } catch (e) {
    console.log('saveUserMessage error: ' + JSON.stringify(e));
    // user is not logged
    // TODO validate email
    data = {email: email, userUid: null, message: message};
    
  }

  console.log('saveUserMessage: userUid: ' + JSON.stringify(data));
  let db = new sqlite3.Database('./word.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });

  // TODO use in-memory database for refreshTokens store
  db = AwaitAsyncPromiseHelper(db);

  var newId = await db.runAsync(`INSERT INTO feed_back(google_uid, email, message) VALUES(?, ?, ?)`, 
    [data.userUid, data.email, data.message]);

  if(newId) {
    res.json({result: 'ok'});
  } else {
    res.json({result: 'error'});
  }
  close(db);
}


async function createUpdateUser(req, res) {
  var userUid = req.authId;

  console.log('createUpdateUser: userUid: ' + userUid);
  let db = new sqlite3.Database('./word.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });

  // TODO use in-memory database for refreshTokens store
  db = AwaitAsyncPromiseHelper(db);
  var userInfo = await getUserInfo(db, userUid);
  console.log('found userInfo: ' + JSON.stringify(userInfo));
  if (userInfo) {
    res.json({userInfo: 'existedUser'});
  } else {
    var newUserId = await db.runAsync(`INSERT INTO user(google_uid) VALUES(?)`, [userUid]);
    userInfo = await db.getAsync(`select * from user u where u.id = ?`, [newUserId]);
    res.json({userInfo: 'newUser'});
  }
  
}

async function getUserPreferences(req, res) {
  var userUid = req.authId;

  let db = new sqlite3.Database('./word.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });
  
  db = AwaitAsyncPromiseHelper(db);

  // find User info 
  var userInfo = await getUserInfo(db, userUid);
  console.log('read preferences: ' + userInfo['preferences']);
  res.json(JSON.parse(userInfo['preferences']));
}

async function updateUserPreferences(req, res) {
  var userUid = req.authId;
  var preferencesData = JSON.parse(req.params['data'].substr(5));

  console.log('update: data: ' + JSON.stringify(preferencesData));

  let db = new sqlite3.Database('./word.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });

  db = AwaitAsyncPromiseHelper(db);

  // find User info (if not found - create user)
  var userInfo = await getUserInfo(db, userUid);

  console.log('userInfo: ' + JSON.stringify(userInfo));

  if(userInfo) {
    await db.runAsync(`update user set preferences = json(?)
      where id = ?`, [JSON.stringify(preferencesData), userInfo['id']]);
  }

  result = await getUserInfo(db, userUid);

  res.json(result['preferences']);

  close(db);

}

module.exports = router;
