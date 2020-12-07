const express = require("express");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

const router = express.Router();

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async (req, res, next) => {
	try {
		const { username, password } = req.body;
		const token = await User.authenticate(username, password);
		return res.json({ token });
	} catch (e) {
		return next(e);
	}
});
/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post("/register", async (req, res, next) => {
	try {
		const user = await User.register(req.body);
		const token = jwt.sign({ userame: user.username }, SECRET_KEY);
		return res.json(token);
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
