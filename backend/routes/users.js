var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();

function close(db) {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Close the database connection.');
  });
}

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

module.exports = router;
