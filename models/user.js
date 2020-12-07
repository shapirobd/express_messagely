/** User class for message.ly */
const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const jwt = require("jsonwebtoken");
const ExpressError = require("../expressError");
/** User of the site. */

class User {
	/** register new user -- returns
	 *    {username, password, first_name, last_name, phone}
	 */

	static async register({ username, password, first_name, last_name, phone }) {
		const hashedPwd = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
		const join_at = new Date().toLocaleDateString();
		const results = await db.query(
			`INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
      		VALUES ($1, $2, $3, $4, $5, $6, $7)
      		RETURNING username, password, first_name, last_name, phone`,
			[username, hashedPwd, first_name, last_name, phone, join_at, join_at]
		);
		return results.rows[0];
	}

	/** Authenticate: is this username/password valid? Returns boolean. */

	static async authenticate(username, password) {
		const results = await db.query(
			`SELECT username, password
			FROM users
      		WHERE username=$1`,
			[username]
		);
		const user = results.rows[0];
		if (user) {
			if (await bcrypt.compare(password, user.password)) {
				const token = jwt.sign({ username }, SECRET_KEY);
				return true;
			}
		}
		return false;
	}

	/** Update last_login_at for user */

	static async updateLoginTimestamp(username) {
		const this_login = new Date().toLocaleDateString();
		const update = await db.query(
			`UPDATE users
			SET last_login_at=$1
			WHERE username=$2`,
			[this_login, username]
		);
	}

	/** All: basic info on all users:
	 * [{username, first_name, last_name, phone}, ...] */

	static async all() {
		const results = await db.query(
			`SELECT username, first_name, last_name, phone
			FROM users`
		);
		return results.rows;
	}

	/** Get: get user by username
	 *
	 * returns {username,
	 *          first_name,
	 *          last_name,
	 *          phone,
	 *          join_at,
	 *          last_login_at } */

	static async get(username) {
		const results = await db.query(
			`SELECT username, first_name, last_name, phone, join_at, last_login_at
			FROM users
			WHERE username=$1`,
			[username]
		);
		if (results.rows.length === 0) {
			throw new ExpressError("User not found", 404);
		}
		return results.rows[0];
	}

	/** Return messages from this user.
	 *
	 * [{id, to_user, body, sent_at, read_at}]
	 *
	 * where to_user is
	 *   {username, first_name, last_name, phone}
	 */

	static async messagesFrom(username) {
		const results = await db.query(
			`SELECT id, to_username, body, sent_at, read_at
			FROM messages
			WHERE from_username=$1`,
			[username]
		);
		if (results.rows.length === 0) {
			throw new ExpressError("User not found", 404);
		}
		const messages = [];
		for (let msg of results.rows) {
			let to_user_results = await db.query(
				`SELECT username, first_name, last_name, phone
				FROM users
				WHERE username=$1`,
				[msg.to_username]
			);
			const to_user = to_user_results.rows[0];
			messages.push({
				id: msg.id,
				to_user,
				body: msg.body,
				sent_at: msg.sent_at,
				read_at: msg.read_at,
			});
		}
		return messages;
	}

	/** Return messages to this user.
	 *
	 * [{id, from_user, body, sent_at, read_at}]
	 *
	 * where from_user is
	 *   {id, first_name, last_name, phone}
	 */

	static async messagesTo(username) {
		const results = await db.query(
			`SELECT id, from_username, body, sent_at, read_at
			FROM messages
			WHERE to_username=$1`,
			[username]
		);
		if (results.rows.length === 0) {
			throw new ExpressError("User not found", 404);
		}
		const messages = [];
		for (let msg of results.rows) {
			let from_user_results = await db.query(
				`SELECT username, first_name, last_name, phone
				FROM users
				WHERE username=$1`,
				[msg.from_username]
			);
			const from_user = from_user_results.rows[0];
			messages.push({
				id: msg.id,
				from_user,
				body: msg.body,
				sent_at: msg.sent_at,
				read_at: msg.read_at,
			});
		}
		return messages;
	}
}

module.exports = User;
