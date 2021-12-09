const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
module.exports = {
  adminAuthenticated: function (req, res, next) {
    let token = req.session.token;
    if (!token | (req.session.user.role != "admin")) {
      res.sendStatus(403);
    }
    if (req.session.user.role == "admin") {
      jwt.verify(token, process.env.TOKEN_KEY, (err, user) => {
        if (err) {
          res.sendStatus(200);
        }
        req.user = user;
        return next();
      });
    }
  },

  userAuthenticated: function (req, res, next) {
    let token = req.session.token;
    if (!token | (req.session.user.role != "user")) {
      res.sendStatus(403);
    }
    if (req.session.user.role == "user") {
      jwt.verify(token, process.env.TOKEN_KEY, (err, user) => {
        if (err) {
          res.sendStatus(200);
        }
        req.user = user;
        return next();
      });
    }
  },
};
