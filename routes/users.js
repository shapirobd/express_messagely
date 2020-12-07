const express = require("express");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

const router = express.Router();

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/", async (req, res, next) => {
	try {
		const users = await User.all();
		return res.json({ users: users });
	} catch (e) {
		return next(e);
	}
});

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username", async (req, res, next) => {
	try {
		const user = await User.get(req.params.username);
		return res.json({ user: user });
	} catch (e) {
		return next(e);
	}
});

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/to", (req, res, next) => {
	try {
		const messages = User.messagesTo(req.params.username);
		return res.json({ messages: messages });
	} catch (e) {
		return next(e);
	}
});

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/from", (req, res, next) => {
	try {
		const messages = User.messagesFrom(req.params.username);
		return res.json({ messages: messages });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
