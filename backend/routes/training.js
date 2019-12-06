var checkIfAuthenticated = require('../auth-middleware');

var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();
var ruleEngine = require('json-rules-engine');

/*
TrainingLoop 
  TrainingSets:
  
  1. выборка уже пройденных слов, но с ошибками в ответах


  select * from word w
  join user_progress up on up.user_id = 1 and up.word_id = w.id and up.cnt_error > cnt_success
  join word wt on w.link_id = wt.link_id and wt.lang = 'ru'

  where w.lang = 'en' 
  order by wt.frequency

  LIMIT 10

  2. выбор слов, которые не встречаются в user_progress

    
  select * from word w

  join word wt on w.link_id = wt.link_id and wt.lang = 'ru'

  where w.lang = 'en' 
  and   w.id not in (select up.word_id 
    from user_progress up where up.user_id = 1)
  order by wt.frequency

  LIMIT 10
*/

// initial Training Loop object
router.get('/init/lang/:langsCouple', checkIfAuthenticated, function (req, res, next) {
  console.log("p: " + req.params['langsCouple']);
  console.log('req.authId: ' + req.authId);
  trainingLoopInit(req, res);
});

// update User Progress by Training Loop 
router.post('/progress/tl', checkIfAuthenticated, function (req, res, next) {
  getStatistics(req, res);
  
});

// update User Progress by word
router.get('/progress/word/:wordId/cnt/:cnt', checkIfAuthenticated, function (req, res, next) {
  console.log("p: " + req.params['cnt']);
  updateUserProgress(req, res);
});

// next Fake Answers
router.get('/fakeAnswers/:wordId/lang/:lang', checkIfAuthenticated, function (req, res, next) {
  fakeAnswers(req, res);
});

async function fakeAnswers(req, res) {
  var userUid = req.authId;
  var wordId = req.params['wordId'];
  var lang = req.params['lang'];

  let db = new sqlite3.Database('./word.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });

  db = AwaitAsyncPromiseHelper(db);

  var userInfo = await getCreateUserInfo(db, userUid);
  var fakeAnswers = JSON.parse(userInfo['preferences']).fakeAnswers - 1;

  var fakeAnswersRows = await db.allAsync(`
      select w.* from word w
      where w.lang = ? and w.id <> ?
      order by random()
      limit ?`, [lang, wordId, fakeAnswers]);
  res.json(fakeAnswersRows);

  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Close the database connection.');
  });

}

// User Progress update
router.post('/update/:id', function (req, res, next) {
  console.log(req.body);
});

// Promise helper
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

async function getStatistics(req, res) {
  var userUid = req.authId;

  let db = new sqlite3.Database('./word.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });

  db = AwaitAsyncPromiseHelper(db);

  var userStatistics = await db.getAsync(
    `select count(*) as statIndex from user_progress up
      join user u on u.google_uid = ?
      join word w on w.id = up.word_id and w.lang = ?
      and up.user_id = u.id `, [userUid, 'en']);

  console.log("update User Progress by Training Loop: " + JSON.stringify(userStatistics));
  
  res.json({'statistics': userStatistics});

  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Close the database connection.');
  });
}

async function getCreateUserInfo(db, userUid) {
  // find User info (if not found - create user)
  var userInfo = await db.getAsync(`select * from user u where u.google_uid = ?`, [userUid]);
  if (!userInfo) {
    // create new User
    var newUserId = await db.runAsync(`INSERT INTO user(google_uid) VALUES(?)`, [userUid]);
    userInfo = await db.getAsync(`select * from user u where u.id = ?`, [newUserId]);
  }
  return userInfo;
}

async function updateUserProgress(req, res) {
  var userUid = req.authId;
  var wordId = req.params['wordId'];
  var cnt = req.params['cnt'];

  console.log('update: ')

  let db = new sqlite3.Database('./word.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });

  db = AwaitAsyncPromiseHelper(db);

  // find User info (if not found - create user)
  var userInfo = await getCreateUserInfo(db, userUid);

  console.log('userInfo: ' + JSON.stringify(userInfo));

  // find record for Word update info
  var userWordProgressInfo = await db.getAsync(`
            SELECT * from user_progress up
            where up.user_id = ? and up.word_id = ?`,
    [userInfo['id'], wordId]);

  console.log('userWordProgressInfo found: ' + JSON.stringify(userWordProgressInfo))

  var cnt_success = 0;
  var cnt_error = 0;
  if (cnt > 0) {
    cnt_success = 1;
  } else {
    cnt_error = 1;
  }

  if (userWordProgressInfo) {
    // word progress has found
    await db.runAsync(`update user_progress set cnt_error = ?, cnt_success = ?
                          where user_id = ? and word_id = ?`,
      [userWordProgressInfo.cnt_error + cnt_error,
      userWordProgressInfo.cnt_success + cnt_success, userInfo['id'], wordId]);
  } else {
    // there are no word progress
    await db.runAsync(`INSERT INTO user_progress(user_id, word_id, cnt_error, cnt_success) VALUES(?, ?, ?, ?)`,
      [userInfo['id'], wordId, cnt_error, cnt_success]);
  }

  // find updated data for Word Progress
  var userWordProgressInfo = await db.getAsync(`
    SELECT * from user_progress up
    where up.user_id = ? and up.word_id = ?`,
    [userInfo['id'], wordId]);

  res.json(userWordProgressInfo);

  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Close the database connection.');
  });

}


// get Training Loop data
// input:
// lang_of_learn, lang_of_translate
async function trainingLoopInit(req, res) {
  var userUid = req.authId;

  applyRules();

  var trainingLoop = { trainingSets: [] };

  let db = new sqlite3.Database('./word.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });


  db = AwaitAsyncPromiseHelper(db);
  var userInfo = await getCreateUserInfo(db, userUid);

  var langPair = JSON.parse(userInfo['preferences']).langPair;
  var loopSize = JSON.parse(userInfo['preferences']).wordsPerLoop;
  console.log('langPair: ' + langPair);
  var lang_of_learn = langPair.split('-')[0];
  var lang_of_translate = langPair.split('-')[1];
  console.log('lang_of_learn: ' + lang_of_learn + " lang_of_translate: " + lang_of_translate);

  var blockRows1 = await db.allAsync(`
        select w.*, wt.id wt_id, wt.word wt_word, wt.lang wt_lang 
          from word w
          join user_progress up on up.word_id = w.id and up.cnt_error > up.cnt_success
          join word wt on w.link_id = wt.link_id and wt.lang = ?
          where w.lang = ? and up.user_id = ?
          order by wt.frequency
          limit ?
          `, [lang_of_translate, lang_of_learn, userInfo['id'], loopSize]);

  var restLimit = loopSize - blockRows1.length;

  var blockRows2 = await db.allAsync(`
      select w.*, wt.id wt_id, wt.word wt_word, wt.lang wt_lang 
      from word w
        join word wt on w.link_id = wt.link_id and wt.lang = ?
        where w.lang = ? 
        and w.id not in (
          select up.word_id 
          from user_progress up 
          where up.user_id = ?)
          order by wt.frequency
        limit ?
        `, [lang_of_translate, lang_of_learn, userInfo['id'], restLimit]);

  var blockRows = new Set([...blockRows1, ...blockRows2]);

  blockRows.forEach(function (el, ind) {
    console.log(JSON.stringify(el))
    //console.log(ind + " : " + el.word + " : " + el.tw_word)
    trainingLoop.trainingSets.push({
      memoryWord: {
        id: el.id,
        lang: el.lang,
        word: el.word
      },
      correctAnswer: {
        id: el.wt_id,
        lang: el.wt_lang,
        word: el.wt_word
      }
    });
  });
  res.json(trainingLoop);


  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Close the database connection.');
  });


}

function applyRules() {
  let engine = new ruleEngine.Engine();
  // const engine = new engine.;
  // define a rule for detecting the player has exceeded foul limits.  Foul out any player who:
  // (has committed 5 fouls AND game is 40 minutes) OR (has committed 6 fouls AND game is 48 minutes)
  engine.addRule({
    conditions: {
      any: [{
        all: [{
          fact: 'gameDuration',
          operator: 'equal',
          value: 40
        }, {
          fact: 'personalFoulCount',
          operator: 'greaterThanInclusive',
          value: 5
        }]
      }, {
        all: [{
          fact: 'gameDuration',
          operator: 'equal',
          value: 48
        }, {
          fact: 'personalFoulCount',
          operator: 'greaterThanInclusive',
          value: 6
        }]
      }]
    },
    event: {  // define the event to fire when the conditions evaluate truthy
      type: 'fouledOut',
      params: {
        message: 'test: Player has fouled out!'
      }
    }
  });

  /**
   * Define facts the engine will use to evaluate the conditions above.
   * Facts may also be loaded asynchronously at runtime; see the advanced example below
   */
  const facts = {

    personalFoulCount: 5,
    gameDuration: 40
  };

  // Run the engine to evaluate
  engine
    .run(facts)
    .then(results => {
      // 'results' is an object containing successful events, and an Almanac instance containing facts
      results.events.map(event => console.log(event.params.message));
    });


}

module.exports = router;
