var admin = require('./firebase-service');

function getCounter() {
  let counter = 0;
  return function() {
  	if(counter > 3)
  		counter = 0;
    return counter++;
  }
}

var counter = getCounter();

const getAuthToken = (req, res, next) => {
  
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    req.authToken = req.headers.authorization.split(' ')[1];
  } else {
    req.authToken = null;
  }
  next();
};

const checkIfAuthenticated = (req, res, next) => {
 getAuthToken(req, res, async () => {
    try {

      // testing authorization
      // var c = counter();
      // console.log('c: ' + c);
      // if(c === 3) {
      //   console.log('throw test');
      //   throw new Error('test');
      // }



      const { authToken } = req;
      const userInfo = await admin.auth().verifyIdToken(authToken);
      // console.log('authToken: ' + JSON.stringify(authToken));
      // console.log('currentUser: ' + admin.auth().currentUser);

      console.log('userInfo: ' + JSON.stringify(userInfo));
      req.authId = userInfo.uid;
      return next();
    } catch (e) {
      console.log('e: ' + e);

      return res
        .status(401)
        .send({ error: 'You are not authorized to make this request' });
    }
  });
};

module.exports = checkIfAuthenticated;