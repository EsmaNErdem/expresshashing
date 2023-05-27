const express = require("express");
const router = new express.Router();
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const ExpressError = require("../expressError");
const { SECRET_KEY } = require("../config");
/** login: {username, password} => {token}
 **/

router.post('/login', async (req, res, next) => {
    try {
      const { username, password } = req.body;

      if ( await User.authenticate(username, password) ) {
        const token = jwt.sign({ username }, SECRET_KEY);
        await User.updateLoginTimestamp(username);
        return res.json({token})
      } else {
        throw new ExpressError("Invalid username/password", 400);
      }
    } catch (e) {
      return next(e);
    }
  })
  
/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async (req, res, next) => {
    try {
      const { username} = await User.register(req.body)
      const token = jwt.sign({ username }, SECRET_KEY);
      await User.updateLoginTimestamp(username)

      return res.json({token});
    } catch (e) {
      if (e.code === '23505') {
        return next(new ExpressError("Username taken. Please pick another!", 400));
      }
      return next(e)
    }
  });

  module.exports = router;